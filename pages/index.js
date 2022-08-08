import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  userAgent: "GitHubTimeline v1.0.0",
});

export default function Home() {
  const {
    query: { username },
  } = useRouter();
  const [repos, setRepos] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    if (username) {
      octokit.rest.repos
        .listForUser({
          sort: "created",
          direction: "asc",
          username,
          auth: process.env.REACT_APP_ACCESS_TOKEN,
        })
        .then(({ data }) => setRepos(data) && setError(null))
        .catch((err) =>
          setError(JSON.parse(JSON.stringify(err)).response.data.message)
        );
    }
  }, [username]);

  console.log(repos);

  return (
    <div>
      <Head>
        <meta
          name="description"
          content="Create and share a timeline of your GitHub repos"
        />
        <title>GitHub Timeline</title>
      </Head>
      <main className={styles.main}>
        {username && !error ? (
          <button className={styles.backToGenerator}>
            <Link href="/">
              <a>Back to generator</a>
            </Link>
          </button>
        ) : (
          <section>
            <h1
              className={styles.title}
              style={{
                textAlign: "center",
                fontSize: "3rem",
              }}
            >
              GitHub Timeline
            </h1>
            <form action="/">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="off"
              />
              <button type="submit">generate</button>
              {error && <h1 className={styles.error}>{error}</h1>}
            </form>
          </section>
        )}
        <section>
          {!error && !repos && username && <h1>Loading...</h1>}
          {repos &&
            username &&
            (repos.length === 0 ? (
              <p>{username} has no repositories yet ):</p>
            ) : (
              <ul className={styles.timeline}>
                {repos.map(
                  ({ name, created_at, description, full_name }, i) => (
                    <li key={i}>
                      <div>
                        <h1 className={styles.title}>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={"https://github.com/" + full_name}
                          >
                            {name}
                          </a>
                        </h1>
                        <time>
                          <i>{new Date(created_at).toDateString()}</i>
                        </time>
                        {description && <p>{description}</p>}
                      </div>
                    </li>
                  )
                )}
              </ul>
            ))}
        </section>
      </main>
    </div>
  );
}
