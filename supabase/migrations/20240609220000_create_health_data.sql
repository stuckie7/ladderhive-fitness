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
