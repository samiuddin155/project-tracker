alter table tasks enable row level security; create policy \
Users
can
insert
their
own
tasks\ on tasks for insert with check (auth.uid() = project_id); create policy \Users
can
view
tasks\ on tasks for select using (true); create policy \Users
can
update
their
own
tasks\ on tasks for update using (auth.uid() = project_id); create policy \Users
can
delete
their
own
tasks\ on tasks for delete using (auth.uid() = project_id);
