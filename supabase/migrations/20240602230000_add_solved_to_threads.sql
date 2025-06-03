-- Add is_solved column
alter table public.forum_threads 
add column if not exists is_solved boolean not null default false;

-- Add solved_at column
alter table public.forum_threads 
add column if not exists solved_at timestamptz;

-- Create an index for better performance
create index if not exists idx_forum_threads_is_solved 
on public.forum_threads (is_solved, last_activity_at desc);

-- Add comment for the new columns
comment on column public.forum_threads.is_solved is 'Indicates if the thread has been marked as solved';
comment on column public.forum_threads.solved_at is 'Timestamp when the thread was marked as solved';

-- Update RLS policies if needed
-- (We'll add any necessary RLS policies in a separate step if required)
