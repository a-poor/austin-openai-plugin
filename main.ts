import { Hono } from 'https://deno.land/x/hono@v3.7.2/mod.ts';
import { logger } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';
import { cors } from 'https://deno.land/x/hono@v3.7.2/middleware.ts'
import { serveStatic } from 'https://deno.land/x/hono@v3.7.2/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.22.2/mod.ts';


const aboutMe = {
  name: "Austin Poor",
  title: "Software Engineer",
  location: "Los Angeles, CA",
  dog: "Sandwich the Dog",
  summary: "Austin is a full-stack software engineer with a passion for building things. He has experience with a wide variety of languages and frameworks and enjoys working with data to solve problems.",
};

const blogPosts = [
  {
    title: "",
    description: "",
    published: "",
    tags: [""],
    url: "",
  },
];

const projects = [
  {
    name: "",
    description: "",
    url: "",
    tags: [""],
  }
];

const contacts = [
  {name: "GitHub", url: "https://github.com/a-poor"},
  {name: "LinkedIn", url: "https://linkedin.com/in/austinpoor"},
  {name: "Mastodon", url: "https://mastodon.social/@austinpoor"},
  {name: "Twitter", url: "https://twitter.com/austin_poor"},
];

const resume = {
  name: "Austin Poor",
  title: "Software Engineer",
  location: "Los Angeles, CA",
  summary: "Austin is a full-stack software engineer with a passion for building things. He has experience with a wide variety of languages and frameworks and enjoys working with data to solve problems.",
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  learnMore: "https://austinpoor.com/about",
};

const skills = [
  ""
];

const sayHiRequestSchema = z.object({
  name: z.string(),
  message: z.string(),
});


function createApp() {
  // Create the app and setup middleware...
  const app = new Hono();
  app.use("*", logger());
  app.use("*", cors({
    origin: ["http://localhost:8000", "https://chat.openai.com"],
  }));

  // Add the endpoints...
  app.get("/", c => c.redirect("https://github.com/a-poor/austin-openai-plugin", 302));
  app.get("/about", c => c.json(aboutMe));
  app.get("/blog", c => c.json({ blogPosts }));
  app.get("/projects", c => c.json({ projects }));
  app.get("/resume", c => c.json(resume));
  app.get("/contact", c => c.json({ contacts }));
  app.get("/skills", c => c.json({ skills }));
  app.post("/sayhi", c => {
    // Parse ther request...
    let req: z.infer<typeof sayHiRequestSchema>;
    try {
      req = sayHiRequestSchema.parse(c.body);
    } catch (err) {
      console.error(err);
      return c.json({
        success: false,
        message: "Sorry, I couldn't understand that. Could you try again?",
      });
    }
    const { name, message } = req;

    // Do something with the message...
    console.log(`Got a message from ${name}: ${message}`);

    // Return the response...
    return c.json({
      success: true,
      message: "I'll pass that along! Thanks!",
    });
  });

  // Add static files...
  app.use('/*', serveStatic({ root: './static' }))

  // Return the app...
  return app;
}


// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const app = createApp();
  Deno.serve(app.fetch);
}
