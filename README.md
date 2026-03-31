
This is my project to learn how to build frontends using React, Typescript and Next.

It features a simple list displaying user information from jsonplaceholder. A detail section displays user no. 3 on the left, and the currently selected user on the right. A simple form can be filled, but has no other function yet.

## Design

### endpoint of data access API

We assume the data layer offers an API for accessing dental data, e.g. extracted from ivoris. Currently that API is not implemented, only mocked.

`/data?startDt=<start date time as epoch millis>;endDt = <end time as epoch millis>`

### chat window

- chat interaction is on the client
- llm invokation is done on the server, called via route / endpoint to be more portable

## Learning

My general strategy was to step through the below learning path and at each step follow this mini-learnflow:

1. Have github copilot generate a first solution.
2. Inspect and have copilot explain details.
3. Change something, then goto 1 and repeat, or stop if concept sufficiently understood.

Learning path:

1. TS basics 

	•	Exercise 1: Interface for User/Post/Todo – fetch data and type the response.
	•	Exercise 2: Generic fetch function for API calls.
	•	Exercise 3: Type guard for User vs. Post.
	•	Exercise 4: Union for loading/error/data states.
	•	Exercise 5: Partial for form updates.

2. Building components with React

- components as functions
- client: useState, useEffect
- simple forms
- props
- conditional rendering

3. Next.js, Routing and Fetching

- client-server split, what to do where
- url search params for dynamic fetching via the server
- route definition through folder structure, Next.js special file and folder names, e.g. dynamic routing via `users/[id]`
- layout



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## TODOs

- invoke LLM through server actions instead of using a route, we do not need to be compatible with other frontends and hence can spare the http overhead.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## bootstrapping comment

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
