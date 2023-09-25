/// <reference lib="deno.unstable" />

import { Hono } from 'https://deno.land/x/hono@v3.7.2/mod.ts';
import { logger } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';
import { cors } from 'https://deno.land/x/hono@v3.7.2/middleware.ts'
import { serveStatic } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.22.2/mod.ts';
import { parse, stringify } from "https://deno.land/std@0.202.0/yaml/mod.ts";



const OPENAPI_PATH = "./openapi.yaml";
const DEV_HOST = "http://localhost:8000";
const PROD_HOST = "https://chatgpt-plugin.austinpoor.com";


const aboutMe = {
  name: "Austin Poor",
  title: "Software Engineer",
  location: "Los Angeles, CA",
  dog: "Sandwich the Dog",
  summary: "Austin is a full-stack software engineer with a passion for building things."
    + " He has experience with a wide variety of languages – like Go, Rust, Python, and TypeScript – and frameworks and enjoys working with data to solve problems."
    + " He likes working with the full application life-cycle – from front-end to back-end to infrastructure to data-engineering/data-analysis."
    + " This tool was created with Deno."
    + " He's lived in New York and Seattle but currently lives in Los Angeles."
    ,
};

const blogPosts = [
  {
    title: "Command or Control",
    subtitle: "Knowing What Modifier Key to Put in Your Search Bar",
    description: "Should your hotkeys use \"Cmd\" or \"Ctrl\"? How can you tell if your user is on a Mac or not? This blog post walks through multiple approaches to OS detection in JavaScript.",
    published: "2023-09-10",
    tags: ["javascript","hotkey","user-agent","javascript-framework","browser-detection"],
    url: "https://austinpoor.com/blog/command-or-control?utm_source=chatgpt",
  },
  {
    title: "On Zero Trust Programming",
    subtitle: "Applying the Concept of Zero Trust Security to the Code We Write",
    description: "Explore the concept of Zero Trust Programming (ZTP), which applies the Zero Trust security model to code, allowing granular permissions and enhancing open source software security. Discover ZTP's potential benefits in reducing vulnerabilities and improving audit processes, while considering the challenges and tradeoffs. Learn how ZTP could be implemented in existing or new languages and ecosystems.",
    published: "2023-05-24",
    tags: ["zero-trust-programming","javascript","open-source-software","open-source-security","software-security"],
    url: "https://austinpoor.com/blog/zero-trust-programming?utm_source=chatgpt",
  },
  {
    title: "Running JavaScript in Rust with Deno",
    subtitle: "Exploring Deno's JavaScript Runtime in a Proof-of-Concept Rust Application for Filtering Text with JS Expressions",
    description: "Explore how the Deno runtime can enable JavaScript code execution in a Rust application via a proof-of-concept project called \"js-in-rs\". Discover the flexibility and versatility of using JavaScript expressions as filters in a CLI, written in Rust, as a powerful alternative to regular expressions. Watch out grep!",
    published: "2023-05-03",
    tags: ["rust","javascript","deno","cli","grep"],
    url: "https://austinpoor.com/blog/js-in-rs?utm_source=chatgpt",
  },
  {
    title: "Making apoor.dev",
    subtitle: "Building a URL Shortener with Rust, Tokio, and Axum.",
    description: "I recently built a URL shortener using Rust, Tokio, and Axum, and in this blog post, I'm sharing my experience. From selecting the right tech stack to load testing the application, I cover everything that went into building this service.",
    published: "2023-04-18",
    tags: ["rust","async","url-shortener","axum","tokio","fly-io"],
    url: "https://austinpoor.com/blog/apoor-dot-dev?utm_source=chatgpt",
  },
  {
    title: "Re-Re-Rewriting My Site in Astro",
    subtitle: "Using the Astro Framework to Make a Simpler, Faster Site",
    description: "Recapping the process of rewriting my personal site and blog using the new Astro framework.",
    published: "2023-03-05",
    tags: ["blog","javscript","astro","framework","frontend"],
    url: "https://austinpoor.com/blog/astro-rewrite?utm_source=chatgpt",
  },
  {
    title: "Serving ML Models with gRPC",
    subtitle: "Skip REST and give gRPC a try",
    description: "gRPC APIs are fast, efficient, and type-safe. Next time you need to create an ML prediction service, ditch REST and give gRPC a shot!",
    published: "2021-12-01",
    tags: ["api","grpc","rest","machine-learning"],
    url: "https://austinpoor.com/blog/serve-ml-with-grpc?utm_source=chatgpt",
  },
  {
    title: "Handling ML Predictions in a Flask App",
    subtitle: "Don't let long-running code slow down your Flask app",
    description: "Two suggested design patterns for making machine learning predictions (or handling other long-running tasks) in Flask apps by adding API routes and Celery.",
    published: "2021-02-18",
    tags: ["data-science","python","flask","machine-learning","celery"],
    url: "https://austinpoor.com/blog/flask-ml-predictions?utm_source=chatgpt",
  },
  {
    title: "Painless Data Augmentation with BigQuery",
    subtitle: "Quickly Augmenting Your Datasets with BigQuery Public Data",
    description: "Google Cloud's BigQuery is a great tool for data scientists to easily augment their datasets with external data – using BigQuery's public datasets.",
    published: "2021-01-07",
    tags: ["data-science","google-cloud-platform","big-query","sql","data"],
    url: "https://austinpoor.com/blog/big-query-data-augmentation?utm_source=chatgpt",
  },
  {
    title: "Algorithmic Color Palettes",
    subtitle: "Using Machine Learning to Generate Color Palettes from Images",
    description: "Using Unsupervised Machine Learning algorithms to generate color palettes from film stills.",
    published: "2020-10-13",
    tags: ["data-science","machine-learning","clustering","color-theory","image-processing"],
    url: "https://austinpoor.com/blog/algorithmic-color-palettes?utm_source=chatgpt",
  },
  {
    title: "Data Scientists, Start Using Profilers",
    subtitle: "Find the parts of your algorithm that are ACTUALLY slowing you down",
    description: "A profiler can show you exactly which parts are taking the most time, allowing you to see which sections to spend time optimizing to speed up your code.",
    published: "2020-08-07",
    tags: ["data-science","python","profiling","algorithms","optimization"],
    url: "https://austinpoor.com/blog/data-science-profilers?utm_source=chatgpt",
  },
  {
    title: "Taking Full Control of Your Python Plots with Jinja",
    subtitle: "Create fully custom plots in Python with SVG and Jinja",
    description: "Next time you want to make a fully customized plot in Python ditch matplotlib and try Jinja. Here's a short tutorial to help you get started.",
    published: "2020-07-02",
    tags: ["python","jinja","data-visualization","data-science","svg"],
    url: "https://austinpoor.com/blog/plots-with-jinja?utm_source=chatgpt",
  },
  {
    title: "Predicting Spotify Track Skips",
    subtitle: "Working on the Spotify Sequential Skip Prediction Challenge",
    description: "Metis Data Science Bootcamp project using machine learning to predict Spotify user track skips for the \"Spotify Sequential Skip Prediction Challenge\".",
    published: "2020-02-18",
    tags: ["spotify","data-science","python","machine-learning","bootcamp"],
    url: "https://austinpoor.com/blog/predict-spotify-skips?utm_source=chatgpt",
  },
  {
    title: "Quickly Load CSVs into PostgreSQL Using Python and Pandas",
    subtitle: "Use Pandas to quickly create and populate a Postgres database",
    description: "Learn a fast way to use Python and Pandas to import CSV data into a Postgres database. Let Pandas infer data types and create the SQL schema for you.",
    published: "2020-02-13",
    tags: ["csv","sql","postgres","pandas","data-science"],
    url: "https://austinpoor.com/blog/csv-to-postgres-with-pandas?utm_source=chatgpt",
  },
];

const projects = [
  {
    name: "Watercooler",
    description: "A desktop application for communicating with ChatGPT, built with Rust, TypeScript, and Tauri.",
    url: "https://github.com/a-poor/watercooler",
    tags: ["typescript","rust","tauri","chatgpt","desktop-app"],
  },
  {
    name: "austinpoor-dot-com",
    description: "My personal site, built with Astro.",
    url: "https://github.com/a-poor/austinpoor-dot-com",
    tags: ["javascript","astro","blog","frontend"],
  },
  {
    name: "apoor-dot-dev",
    description: "A URL shortener written in Rust and deployed to Fly.io.",
    url: "https://github.com/a-poor/apoor-dot-dev",
    tags: ["rust","fly-io","url-shortener"],
  },
  {
    name: "Predicting Spotify Track Skips",
    description: "Using a dataset of listening sessions to predict whether or not a user would skip a given track.",
    url: "https://github.com/a-poor/spotify-skip-prediction",
    tags: ["spotify","data-science","python","machine-learning","bootcamp"],
  },
  {
    name: "vhttp",
    description: "A simple HTTP testing library for Go.",
    url: "https://github.com/a-poor/vhttp",
    tags: ["go","testing","http"],
  },
  {
    name: "ssh.austinpoor.com",
    description: "A sample TUI SSH server built with Go, Wish, and Lipgloss. Give it a try at ssh.austinpoor.com!",
    url: "https://github.com/a-poor/apoor-ssh",
    tags: ["go","tui","ssh"],
  },
];

const contacts = [
  {name: "GitHub", url: "https://github.com/a-poor"},
  {name: "LinkedIn", url: "https://linkedin.com/in/austinpoor"},
  {name: "Mastodon", url: "https://mastodon.social/@austinpoor"},
  {name: "Twitter", url: "https://twitter.com/austin_poor"},
];

const skills = [
  "Go",
  "Python",
  "JavaScript/TypeScript",
  "SQL",
  "Rust",
  "Docker",
  "AWS",
  "REST APIs",
  "gRPC APIs",
  "React",
  "Svelte",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "DynamoDB",
  "TensorFlow",
];

const resume = {
  name: "Austin Poor",
  title: "Software Engineer",
  location: "Los Angeles, CA",
  summary: "Austin is a full-stack software engineer with a passion for building things. He has experience with a wide variety of languages and frameworks and enjoys working with data to solve problems.",
  experience: [
    {
      title: "Full Stack Software Engineer",
      company: "Command Credit",
      location: "Rhinbeck, NY (Remote)",
      startDate: "April 2021",
      endDate: null,
      description: "- Inherited full-stack support and development responsibilities for two web commerce systems with API interfaces to major credit bureaus in my third month of tenure.\n- Designed and implemented an internal API to standardize and simplify software architecture across two systems built by multiple teams.\n- Proposed and designed an AWS-based standard architecture replatforming strategy to save the firm money and reduce operational risks.",
    },
    {
      title: "Data Analyst",
      company: "Freelance",
      location: "Remote",
      startDate: "March 2020",
      endDate: "April 2021",
      description: "- Identified, collected, merged, normalized, and presented longitudinal US census and population health data on murders, suicides, and overdose deaths to inform City University of New York's professor's research on population health trends in coastal South Carolina.\n- Developed a web scraper to gather, consolidate, normalize, and present City of Canton, OH housing code violations and low-interest loan application site data into Excel reports to inform City's Low-Interest Loan Community Redevelopment investment targeting.\n- Healthcare provider profiles and market share data acquisition, consolidation, and analysis model for NTT Data Systems healthcare industry vertical.",
    },
    {
      title: "Assistant to the Executive Creative Director",
      company: "CHRLX",
      location: "New York, NY",
      startDate: "October 2014",
      endDate: "July 2017",
      description: "Managed the Exec. Creative Director's schedule, tasks, and priorities with internal team members, freelancers, and clients.\n- Coordinated across multiple teams of staff, contractors, and clients in a fast-paced, deadline-oriented creative environment.\n- Served as an on-site project coordinator to coordinate with producers and technical staff regarding client project deliveries and issue resolution.",
    },
  ],
  education: [
    {
      school: "Sarah Lawrence College",
      degree: "BA in Computer Science",
      graduation: "December 2019",
      location: "Bronxville, NY",
      selectCourses: [
        "Bio-Inspired Artificial Intelligence",
        "Databases",
        "Computer Architecture",
        "Quantum Computing",
      ],
    },
  ],
  certifications: [
    {
      name: "AWS Certified Cloud Practitioner",
      date: "January 2021",
      url: "https://www.youracclaim.com/badges/7b719925-2f06-47f3-9ef6-0aab7b03d645/public_url",
    },
  ],
  skills,
  learnMore: "https://austinpoor.com/about",
};

const sayHiRequestSchema = z.object({
  name: z.string(),
  message: z.string(),
});


function getAIPluginFile(isProd: boolean) {
  // Set the paths based on the environment...
  const host = isProd ? PROD_HOST : DEV_HOST;

  // Format and return the data...
  return {
    schema_version: "v1",
    name_for_human: "Ask About Austin",
    name_for_model: "askAboutAustin",
    description_for_human: "A tool that allows the user to get information about Austin Poor.",
    description_for_model: "A tool that allows the user to get information about Austin Poor."
      + " This tool was created by Austin (https://austinpoor.com)."
      + " The code for the tool is open source and can be found on Austin's GitHub (https://github.com/a-poor)."
      + "\n\n"
      + "This tool mostly acts as a way to interact with the information on Austin's website (e.g. his blog posts, some of his projects, his skills, his resume, and other information about him)."
      + " Additionally the tool allows the user to send a message to Austin (via `sayHi`)."
      + "\n\n"
      + "For more information about Austin or about this tool, check-out his website (https://austinpoor.com)."
      ,
    auth: {
        type: "none"
    },
    api: {
        type: "openapi",
        url: host + "/openapi.json",
    },
    logo_url: host + "/logo.png",
    contact_email: "hello@austinpoor.com",
    legal_info_url: "https://github.com/a-poor/austin-openai-plugin"
  };
}

async function getOpenAPIFile(isProd: boolean) {
  // Set the paths based on the environment...
  const host = isProd ? PROD_HOST : DEV_HOST;

  // Load the file...
  const raw = await Deno.readTextFile(OPENAPI_PATH);

  // Parse the file...
  const data = parse(raw) as { servers: { url: string }[] };

  // Set the servers...
  data.servers = [{ url: host }];

  // Return the data...
  return data;
}

async function createApp(isProd: boolean) {
  // Get the host path...
  const host = isProd ? PROD_HOST : DEV_HOST;

  // Get the AI plugin file...
  const aiPluginFile = getAIPluginFile(isProd);

  // Get the OpenAPI file...
  const openAPIFile = await getOpenAPIFile(isProd);

  // Load the key/value store...
  const kv = await Deno.openKv();

  // Create the app and setup middleware...
  const app = new Hono();
  app.use("*", logger());
  app.use("*", cors({
    origin: [host, "https://chat.openai.com"],
  }));

  // Add the endpoints...
  app.get("/", c => c.redirect("https://github.com/a-poor/austin-openai-plugin", 302));
  app.get("/about", c => c.json(aboutMe));
  app.get("/blog", c => c.json({ blogPosts }));
  app.get("/projects", c => c.json({ projects }));
  app.get("/resume", c => c.json(resume));
  app.get("/contact", c => c.json({ contacts }));
  app.get("/skills", c => c.json({ skills }));
  app.post("/sayhi", async (c) => {
    let reqBody: string;
    try {
      reqBody = await c.req.json();
    } catch (err) {
      console.error(err);
      return c.json({
        success: false,
        message: "Sorry, I couldn't understand that. Could you try again?",
      });
    }

    // Parse ther request...
    let data: z.infer<typeof sayHiRequestSchema>;
    try {
      data = sayHiRequestSchema.parse(reqBody);
    } catch (err) {
      console.error(err);
      return c.json({
        success: false,
        message: "Sorry, I couldn't understand that. Could you try again?",
      });
    }
    const { name, message } = data;

    // Do something with the message...
    console.log(`Got a message from ${JSON.stringify(name)}: ${JSON.stringify(message)}`);
    const key = [Date.now(), crypto.randomUUID()];
    await kv.set(key, data);

    // Return the response...
    return c.json({
      success: true,
      message: "I'll pass that along! Thanks!",
    });
  });

  // Add static files...
  app.get('/.well-known/ai-plugin.json', c => c.json(aiPluginFile));
  app.get('/openapi.json', c => c.json(openAPIFile));
  app.get('/openapi.yaml', () => new Response(
    stringify(openAPIFile), {
      status: 200,
      headers: { 'Content-Type': 'text/yaml' },
    }));
  app.use('/*', serveStatic({ root: './static' }));

  // Return the app...
  return app;
}


// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // Is prod?
  const isProd = Deno.env.get("ENV") === "prod";
  console.log(`Running in ${isProd ? "prod" : "dev"} mode.`);

  // Create the app...
  const app = await createApp(isProd);

  // Serve the app...
  Deno.serve(app.fetch);
}
