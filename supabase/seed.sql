-- Seed a starter skill catalog so the marketplace has content on day one.
insert into public.skills (name, category) values
  ('JavaScript', 'Programming'),
  ('Python', 'Programming'),
  ('React', 'Programming'),
  ('SQL & Databases', 'Programming'),
  ('UI/UX Design', 'Design'),
  ('Figma', 'Design'),
  ('Photography', 'Creative'),
  ('Guitar', 'Music'),
  ('Piano', 'Music'),
  ('Singing', 'Music'),
  ('Spanish', 'Languages'),
  ('French', 'Languages'),
  ('English Conversation', 'Languages'),
  ('Public Speaking', 'Business'),
  ('Resume & Interview Prep', 'Business'),
  ('Digital Marketing', 'Business'),
  ('Cooking Basics', 'Lifestyle'),
  ('Yoga', 'Lifestyle'),
  ('Chess', 'Games'),
  ('Watercolor Painting', 'Creative')
on conflict (name) do nothing;
