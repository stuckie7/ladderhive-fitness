-- Create workout_history table
create table workout_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  workout_name text not null,
  date date not null,
  duration_minutes integer not null,
  exercises jsonb not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table workout_history enable row level security;

create policy "Public access to workout history"
  on workout_history for all
  using (auth.uid() = user_id);

-- Create index for better performance
create index workout_history_user_id_idx on workout_history(user_id);
create index workout_history_date_idx on workout_history(date);
