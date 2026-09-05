-- Remove existing backgrounds and add the specific video
DELETE FROM backgrounds;

INSERT INTO backgrounds (url, is_video) VALUES ('https://offvlzgotgqlnecpktfn.supabase.co/storage/v1/object/public/backgrounds/20250308_2204_Mentors%20Table%20Reveal_simple_compose_01jntxqdxbechrj4hydys1x2dq.mp4', true);