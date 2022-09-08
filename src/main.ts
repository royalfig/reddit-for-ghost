import "./style.css";

const redditEndpoint = "https://www.reddit.com/r/all/top/.json?";

export async function getRedditPosts(): Promise<
  {
    data: {
      author: string;
      url: string;
      subreddit: string;
      title: string;
      ups: number;
      upvote_ratio: number;
      permalink: string;
      created_utc: number;
      post_hint: string;
      media: {};
      over_18: boolean;
    };
  }[]
> {
  const res = await fetch(
    redditEndpoint + new URLSearchParams({ limit: "100" })
  );
  const {
    data: { children },
  } = await res.json();
  console.log({ children });
  return children;
}

function createSnippet(
  author: string,
  subreddit: string,
  ups: number,
  upvote_ratio: number,
  permalink: string
): string {
  return `{\"version\":\"0.3.1\",\"atoms\":[],\"cards\":[],\"markups\":[[\"a\",[\"href\",\"https://reddit.com${permalink}\"]]],\"sections\":[[1,\"p\",[[0,[],0,\"Posted by ${author} in ${subreddit} with ${ups} upvotes and an upvote ratio of ${
    upvote_ratio * 100
  }% \"],[0,[0],1,\"See the original post.\"]]]],\"ghostVersion\":\"4.0\"}`;
}

function isFeatureImage(url: string): string | null {
  if (
    url.endsWith("jpg") ||
    url.endsWith("png") ||
    url.endsWith("jpeg") ||
    url.endsWith("webp") ||
    url.endsWith("avif")
  ) {
    return url;
  }

  return null;
}

interface Post {
  id: number;
  title: string;
  feature_image: string | null;
  mobiledoc: any;
  tags: string[];
  status: string;
  published_at: string;
}

export async function convertToGhostExport() {
  const redditPosts = await getRedditPosts();

  if (!redditPosts) return;

  let tags: string[] = [];

  const ghostPosts = redditPosts.reduce(
    (previous: Array<Post>, current, idx) => {
      const {
        data: {
          author,
          url,
          over_18,
          subreddit,
          title,
          ups,
          upvote_ratio,
          permalink,
          created_utc,
          // post_hint,
          // media,
        },
      } = current;

      if (over_18) {
        return previous;
      }

      tags.push(subreddit);

      const content = createSnippet(
        author,
        subreddit,
        ups,
        upvote_ratio,
        permalink
      );

      const post = {
        id: idx,
        title: title.substring(0, 191),
        feature_image: isFeatureImage(url),
        mobiledoc: content,
        tags: [subreddit],
        status: "published",
        published_at: new Date(created_utc * 1000).toISOString(),
      };

      previous.push(post);

      return previous;
    },
    []
  );

  let id = 0;

  const uniqueTags = tags.reduce<any[]>((p, c) => {
    console.log(p, c);
    if (!p.length) {
      p.push({ id: id++, name: c });
      return p;
    }

    const check = p.some((el) => el.name === c);

    if (check) {
      return p;
    }

    p.push({ id: id++, name: c });
    return p;
  }, []);

  const postAndTags = ghostPosts.map((post) => {
    const { id } = uniqueTags.find((tag) => tag.name === post.tags[0]);

    return { tag_id: id, post_id: post.id };
  });

  console.log(postAndTags);

  const posts = {
    meta: { exported_on: Date.now(), version: "5.0.0" },
    data: { posts: ghostPosts, tags: uniqueTags, posts_tags: postAndTags },
  };
  return posts;
}

const generateButton = document.querySelector("#generate");

generateButton?.addEventListener("click", async () => {
  document.querySelector("a")?.remove();
  const container = document.querySelector(".container")!;
  const p = document.createElement("p");
  p.textContent = "Gettin' those spicy posts...";
  container.append(p);
  const result = await convertToGhostExport();
  if (!result) throw Error("Can't complete operation. Please try again.");

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(result));
  const downloadButton = document.createElement("a");
  downloadButton.textContent = "Download";

  if (!downloadButton) throw Error("Something bad happened. Call a shrink");
  downloadButton?.setAttribute("href", dataStr);
  downloadButton?.setAttribute("download", "export.json");
  document.querySelector("p")?.remove();
  container.append(downloadButton);
});
