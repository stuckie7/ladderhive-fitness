-- Enable required extensions if they don't exist
create extension if not exists "uuid-ossp";
create extension if not exists http;

-- Create health data table
create table if not exists health_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data_type text not null,
  value numeric not null,
  unit text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  source text not null default 'health',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_data_type_date unique (user_id, data_type, start_date, end_date)
);

-- Enable RLS
alter table health_data enable row level security;

-- Create policies
create policy "Users can view their own health data"
  on health_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own health data"
  on health_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own health data"
  on health_data for update
  using (auth.uid() = user_id);

create policy "Users can delete their own health data"
  on health_data for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_health_data_user_id on health_data(user_id);
create index if not exists idx_health_data_dates on health_data(start_date, end_date);
create index if not exists idx_health_data_type on health_data(data_type);

-- Create function to update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create or replace trigger update_health_data_updated_at
before update on health_data
for each row
execute function update_updated_at_column();

-- Create trigger for user_connections updated_at
create or replace trigger update_user_connections_updated_at
before update on user_connections
for each row
execute function update_updated_at_column();

-- Function to handle Fitbit token refresh
create or replace function refresh_fitbit_token(connection_id uuid)
returns json as $$
declare
  connection_record user_connections%rowtype;
  response http_response;
  result jsonb;
  new_tokens jsonb;
begin
  -- Get the connection record
  select * into connection_record from user_connections where id = connection_id and provider = 'fitbit';
  if not found then
    raise exception 'Fitbit connection not found';
  end if;

  -- Make request to refresh token
  select content::jsonb into result
  from http(('POST', 'https://api.fitbit.com/oauth2/token')::http_request, 
           'client_id=' || current_setting('app.settings.fitbit_client_id', true) || 
           '&grant_type=refresh_token' ||
           '&refresh_token=' || connection_record.refresh_token,
           ARRAY[
             ('Content-Type', 'application/x-www-form-urlencoded'),
             ('Authorization', 'Basic ' || encode((current_setting('app.settings.fitbit_client_id', true) || ':' || 
                                               current_setting('app.settings.fitbit_client_secret', true))::bytea, 'base64'))
           ]);

  -- Update the connection with new tokens
  new_tokens := result -> 0 -> 'content';
  
  update user_connections
  set access_token = new_tokens->>'access_token',
      refresh_token = new_tokens->>'refresh_token',
      expires_at = now() + ((new_tokens->>'expires_in')::int * interval '1 second'),
      updated_at = now()
  where id = connection_id;

  -- Return the new tokens
  return new_tokens::json;
exception when others then
  raise exception 'Failed to refresh Fitbit token: %', sqlerrm;
end;
$$ language plpgsql security definer;

-- Function to get or refresh Fitbit token
create or replace function get_fitbit_token(user_id_param uuid)
returns json as $$
declare
  connection_record user_connections%rowtype;
  seconds_until_refresh int;
begin
  -- Get the connection record
  select * into connection_record 
  from user_connections 
  where user_id = user_id_param 
    and provider = 'fitbit'
  limit 1;
  
  if not found then
    raise exception 'No Fitbit connection found for user';
  end if;
  
  -- Check if token needs refresh (refresh 5 minutes before expiry)
  select extract(epoch from (connection_record.expires_at - interval '5 minutes' - now()))::int 
  into seconds_until_refresh;
  
  if seconds_until_refresh <= 0 then
    -- Token needs refresh
    return refresh_fitbit_token(connection_record.id);
  else
    -- Return current token
    return json_build_object(
      'access_token', connection_record.access_token,
      'refresh_token', connection_record.refresh_token,
      'expires_in', seconds_until_refresh + 300,  -- Add back the 5 minutes
      'token_type', 'Bearer'
    );
  end if;
end;
$$ language plpgsql security definer;
