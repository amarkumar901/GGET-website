-- DEMO / PLACEHOLDER DATA — replace before launch. Not real trust accomplishments.

insert into site_settings (key, value) values (
  'org',
  $${
    "trust_name": "Aarohan Education Trust",
    "short_name": "Aarohan",
    "founder_name": "Meera Krishnan",
    "tagline": "Education can change a child's entire future.",
    "supporting_message": "We're working to make sure financial circumstances never decide how far a child can dream.",
    "location": "Bengaluru, Karnataka, India",
    "registered_address": "Bengaluru, Karnataka, India",
    "email": "hello@aarohan.example",
    "phone": "+91 80 0000 0000",
    "trust_registration_number": "",
    "pan": "",
    "twelve_a": "",
    "eighty_g": "",
    "fcra_status": "",
    "instagram": "",
    "facebook": "",
    "youtube": "",
    "linkedin": "",
    "mission": "Provide education and educational opportunities to children from economically disadvantaged communities.",
    "vision": "Create a future where financial circumstances never determine a child's ability to receive quality education.",
    "receipt_prefix": "AAROHAN",
    "authorised_signatory_name": "Meera Krishnan",
    "authorised_signatory_title": "Managing Trustee",
    "hero_image": "/images/hero.jpg",
    "founder_image": "/images/founder.jpg",
    "demo": true
  }$$::jsonb
);

insert into site_settings (key, value) values (
  'flags',
  $${
    "foreign_donations_enabled": false,
    "is_80g_approved": false,
    "monthly_donations_enabled": false,
    "demo_banner": true,
    "foreign_donation_message": "We are not currently able to accept contributions from foreign citizens or entities. If you would like to support the trust, please write to us and we will share the appropriate next step."
  }$$::jsonb
);

insert into site_settings (key, value) values (
  'seo',
  $${
    "default_title": "Aarohan Education Trust",
    "default_description": "A charitable educational trust working so that financial circumstances never decide how far a child can dream.",
    "ga_id": "",
    "gtm_id": "",
    "meta_pixel_id": ""
  }$$::jsonb
);

insert into site_settings (key, value) values (
  'donation',
  $${
    "min_paise": 10000,
    "max_paise": 50000000,
    "preset_paise": [50000, 100000, 250000, 500000, 1000000],
    "currency": "INR"
  }$$::jsonb
);

insert into content_blocks (id, title, body, image_url) values
(
  'problem',
  'Talent is everywhere. Opportunity isn''t.',
  'Across India, children sit in classrooms with the same curiosity as children anywhere else — and then the path narrows. A missing textbook. A school that cannot keep a teacher. A family that must choose between fees and food. None of this is about ability. It is about whether a child is given a fair chance to keep learning.

Aarohan exists to close that gap, patiently and locally: supporting learning, placing materials in children''s hands, and helping promising students stay in school. We will publish verified numbers as the work is measured — not before.',
  '/images/problem.jpg'
),
(
  'hero',
  'Education can change a child''s entire future.',
  'We''re working to make sure financial circumstances never decide how far a child can dream.',
  '/images/hero.jpg'
),
(
  'founder_note',
  'A note from the founder',
  'I started Aarohan because I kept meeting children whose school stories ended too early — not from lack of will, but from lack of a stable chance. This trust is my attempt to make that chance ordinary.

The photograph and biography on this page are demonstration placeholders. They must be replaced with the real founder''s words, portrait, and consent before the site is used in public.',
  '/images/founder.jpg'
),
(
  'founder_bio',
  'Founder',
  'Meera Krishnan (placeholder name) is presented here only so the layout of the Founder page can be reviewed. Replace this biography, the reason for starting the trust, the personal message, and the ten-year vision with the real founder''s approved text before launch.

Reason for starting the trust: to build a durable, transparent vehicle for educational support in communities where children are pushed out of school by cost and circumstance.

Personal message: if you are reading this as a donor, volunteer, or partner, thank you for considering the work. Please treat every child''s story as a responsibility, not a marketing asset.

Vision for the next 5–10 years: a network of learning centres, a scholarship pipeline that is boringly reliable, and public reporting that a parent could read without a lawyer.',
  '/images/founder.jpg'
),
(
  'final_cta',
  'A small opportunity can change the direction of a life.',
  'Give once, give monthly when it is offered, volunteer your time, or bring your organisation in as a partner. Every path is useful.',
  '/images/school-sunrise.jpg'
),
(
  'funds_use',
  'How funds are used',
  'We will publish a verified allocation of programme, learning materials, and operating costs after the first audited year. Until those figures exist, we do not display invented percentages.',
  null
),
(
  'values',
  'How we try to work',
  'Dignity first. Children are not content. Transparency over theatre. Local partners over distant slogans. Evidence before claims. Care with photographs, names, and school identities.',
  null
);

insert into programs (id, title, slug, short_description, long_description, cover_image, gallery, impact_metrics, status, seo_title, seo_description, sort_order) values
(
  'prog_education',
  'Education Support',
  'education-support',
  'After-school learning, remedial teaching, and classroom support so children can keep up — and keep going.',
  'Education Support is the trust''s core programme. We work with local educators to run after-school learning sessions, remedial groups, and classroom assistance in communities where children are at risk of falling behind or leaving school.

What we do
• Identify children who are slipping in language and mathematics
• Run small-group sessions with trained facilitators
• Support government and low-fee schools with teaching assistance rather than replacing them
• Review attendance and learning with families, never with shame

This page describes the intended model. Session counts and child-level outcomes will appear here only after they are recorded and reviewed. Photographs of children are used only with consent, and never with full names or precise locations.',
  '/images/program-education.jpg',
  '["/images/program-education.jpg","/images/learning-circle.jpg","/images/hero.jpg"]'::jsonb,
  '[]'::jsonb,
  'published',
  'Education Support — Aarohan Education Trust',
  'After-school learning and remedial teaching for children who need a fair chance to keep up.',
  1
),
(
  'prog_materials',
  'Learning Materials',
  'learning-materials',
  'Notebooks, readers, school kits, and classroom supplies — ordinary tools that decide whether a child can actually study.',
  'A child cannot do homework on the back of a ration slip forever. Learning Materials places essential supplies — notebooks, pencils, age-appropriate readers, slates, and classroom kits — with children and learning centres that need them.

Kits are assembled with teachers, not guessed from a catalogue. We record what was distributed and to which centre. We do not claim that a particular rupee amount “equals” a child''s year in school unless an administrator has verified that relationship in the donations panel.

Images on this programme page show materials and spaces, not identified children.',
  '/images/program-materials.jpg',
  '["/images/program-materials.jpg","/images/library.jpg","/images/digital-learning.jpg"]'::jsonb,
  '[]'::jsonb,
  'published',
  'Learning Materials — Aarohan Education Trust',
  'School kits, readers, and classroom supplies for children and learning centres.',
  2
),
(
  'prog_scholarships',
  'Scholarships',
  'scholarships',
  'Targeted financial support so a student can stay in school or take the next qualifying exam without the year collapsing.',
  'Scholarships at Aarohan are not trophies. They are practical grants — fees, exam costs, transport, or boarding top-ups — for students who would otherwise leave.

Each grant is tied to a named programme year, a school or course (never published with the child''s full identity), and a simple continuation check. We prefer fewer, reliable scholarships over a large unverified number.

The student photograph on this page is a demonstration image of an adult learner, used with the understanding that it is placeholder art, not a real scholarship recipient.',
  '/images/program-scholarships.jpg',
  '["/images/program-scholarships.jpg","/images/library.jpg"]'::jsonb,
  '[]'::jsonb,
  'published',
  'Scholarships — Aarohan Education Trust',
  'Practical grants so students can stay in school when money would otherwise end the year.',
  3
);

insert into campaigns (id, title, slug, description, short_description, hero_image, goal_amount_paise, start_date, end_date, status, featured, program_id, seo_title, seo_description) values
(
  'camp_learning',
  'Keep a learning centre open this year',
  'learning-centre-year',
  'This demonstration campaign exists so donors can see how a live fundraiser will look. The goal amount is a planning figure, not money already committed or spent. Raised totals are calculated only from verified successful donations.

A learning centre in this model is a rented or shared room, a facilitator, and a cupboard of materials. Your contribution, once payments are enabled with a live key, is recorded against this campaign and issued a receipt.',
  'A demonstration campaign for facilitator time, rent, and materials for one learning centre.',
  '/images/learning-circle.jpg',
  50000000,
  '2026-04-01',
  '2027-03-31',
  'active',
  true,
  'prog_education',
  'Keep a learning centre open — Aarohan',
  'Support facilitator time, rent, and materials for a community learning centre.'
),
(
  'camp_kits',
  'School kits for the new term',
  'school-kits-new-term',
  'A second demonstration campaign: notebooks, readers, and stationery assembled with teachers before a new term. Progress on this page is not hardcoded — it will move only when donations are verified as paid.

Until Razorpay live keys are configured, checkout runs in a clearly labelled demonstration mode and does not move real money.',
  'Notebooks, readers, and stationery for a new term — demonstration campaign.',
  '/images/program-materials.jpg',
  15000000,
  '2026-05-01',
  '2026-12-31',
  'active',
  true,
  'prog_materials',
  'School kits for the new term — Aarohan',
  'Help assemble school kits before the new term.'
);

insert into stories (id, title, slug, display_name, cover_image, excerpt, body, program_id, published_at, featured, consent_obtained, is_composite, seo_title, seo_description, status) values
(
  'story_notebook',
  'The notebook that lasted a term',
  'notebook-that-lasted',
  'A student in Class 6',
  '/images/story-hands.jpg',
  'A composite sketch of what it means when a child finally has paper of their own. Not a real identified child.',
  'This is a composite, illustrative story — DEMO PLACEHOLDER. It is not about a named child, school, or village.

A Class 6 student had been tearing pages from a sibling''s leftover diary. Homework looked like a secret. When a simple ruled notebook arrived through a learning-materials kit, the work became ordinary: sums, a copied poem, a teacher''s signature. Ordinary is the point.

We will only publish real stories when a parent or guardian has given media consent, and we will still withhold full names, addresses, and school identities. Until then, treat every narrative on this website as a sketch of the problem — not a claim about a particular child.',
  'prog_materials',
  '2026-06-01',
  true,
  false,
  true,
  'The notebook that lasted a term — Aarohan',
  'A composite sketch about learning materials. Not a real identified child.',
  'published'
),
(
  'story_evening',
  'An evening class after the fields',
  'evening-class',
  'A learning-centre group',
  '/images/learning-circle.jpg',
  'Composite: what a remedial hour can look like when school alone is not enough.',
  'This is a composite, illustrative story — DEMO PLACEHOLDER.

In many households a child''s afternoon belongs to work, siblings, or a long walk home. An evening circle — a verandah, a mat, a facilitator — is not a miracle. It is extra time with someone who will sit with a fraction until it yields.

When we have consented, verified stories, they will replace this one. We will still write them without full names and without pinning a child to a map.',
  'prog_education',
  '2026-06-15',
  true,
  false,
  true,
  'An evening class after the fields — Aarohan',
  'A composite sketch of after-school learning. Not a real identified group.',
  'published'
),
(
  'story_exam',
  'Staying on for the exam year',
  'staying-on-for-the-exam',
  'A student in Class 10',
  '/images/program-scholarships.jpg',
  'Composite: a scholarship as a practical stay, not a prize-giving.',
  'This is a composite, illustrative story — DEMO PLACEHOLDER. The photograph is demonstration artwork of a young adult learner, not a documented beneficiary.

Exam years are when families do the hardest arithmetic. A scholarship here is meant to be dull: fees paid, bus pass renewed, the student still in the roll call. We will not publish a real student''s board results, school name, or photograph without consent and a careful anonymised treatment.

If you are a donor reading this, the honest status is: the programme shape is designed; the first verified recipients have not been entered yet.',
  'prog_scholarships',
  '2026-07-01',
  false,
  false,
  true,
  'Staying on for the exam year — Aarohan',
  'A composite sketch of scholarship support. Not a real identified student.',
  'published'
);

insert into impact_metrics (id, label, value_text, numeric_value, suffix, sort_order, is_placeholder) values
('m_children', 'Children supported', '—', null, null, 1, true),
('m_centres', 'Learning centres', '—', null, null, 2, true),
('m_communities', 'Communities reached', '—', null, null, 3, true),
('m_scholarships', 'Scholarships provided', '—', null, null, 4, true),
('m_volunteers', 'Volunteers', '—', null, null, 5, true);

insert into donation_impact_presets (id, amount_paise, label, description, verified, sort_order) values
('p500', 50000, 'Learning support', 'A contribution at this level helps the trust continue education support. No specific child outcome is claimed for this amount until an administrator verifies the relationship.', false, 1),
('p1500', 150000, 'Educational resources', 'Helps fund learning materials and classroom supplies. Descriptions stay general until verified.', false, 2),
('p5000', 500000, 'Extended learning support', 'Supports a larger share of programme work. Not a guaranteed sponsorship of a named child.', false, 3),
('p25000', 2500000, 'Support a larger initiative', 'A substantial gift toward a campaign or centre. Allocation is reported after the fact, not promised as a package.', false, 4);

insert into founder_timeline (id, year, title, body, sort_order) values
('t1', 'Idea', 'The question that would not leave', 'DEMO PLACEHOLDER. Replace with the real origin: a year, a place, a reason the trust had to exist.', 1),
('t2', 'Formation', 'A trust, not a gesture', 'DEMO PLACEHOLDER. Replace with the registration year and the first trustees once those facts are confirmed.', 2),
('t3', 'Now', 'Building in public', 'The website, the donation flow, and the reporting tools are being prepared before impact claims. That order is deliberate.', 3),
('t4', 'Next', 'Centres, scholarships, evidence', 'DEMO PLACEHOLDER. Replace with a five-to-ten-year plan the board has actually approved.', 4);

insert into documents (id, title, doc_type, year, file_url, published) values
('d_reg', 'Trust registration', 'registration', null, null, false),
('d_12a', '12A registration', '12a', null, null, false),
('d_80g', '80G approval', '80g', null, null, false),
('d_fcra', 'FCRA status', 'fcra', null, null, false);

insert into media (id, url, alt_text, caption, consent_flag) values
('media_hero', '/images/hero.jpg', 'Classroom seen from the back, children not identifiable', 'Demonstration photograph. Not a documented Aarohan centre.', false),
('media_founder', '/images/founder.jpg', 'Portrait of a woman, demonstration founder image', 'DEMO PLACEHOLDER — replace with the real founder''s approved portrait.', false),
('media_hands', '/images/story-hands.jpg', 'Child''s hands on an open primer, no face visible', 'Used to illustrate learning, not to identify a child.', false);
