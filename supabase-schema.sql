-- Bảng lưu tài sản công ty
create table assets (
  id text primary key,
  name text not null,
  category text,
  status text default 'storage',
  assignee text default '',
  location text default '',
  purchase_date date,
  value numeric default 0,
  note text default '',
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Bật Row Level Security (bắt buộc trên Supabase)
alter table assets enable row level security;

-- Cho phép đọc/ghi công khai (phù hợp app nội bộ dùng chung 1 link, không có đăng nhập).
-- Nếu sau này thêm đăng nhập, nên thay policy này bằng điều kiện theo auth.uid().
create policy "Cho phep doc cong khai" on assets
  for select using (true);
create policy "Cho phep them cong khai" on assets
  for insert with check (true);
create policy "Cho phep sua cong khai" on assets
  for update using (true);
create policy "Cho phep xoa cong khai" on assets
  for delete using (true);

-- Bật realtime để các thiết bị tự đồng bộ khi có người khác sửa
alter publication supabase_realtime add table assets;
