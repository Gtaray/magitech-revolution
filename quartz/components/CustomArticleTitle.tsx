import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import { classNames } from "../util/lang";
import { stripNumericPrefix } from "../util/prefixStrip";

/**
 * Custom ArticleTitle component that strips numeric prefixes from page titles
 * Wraps the functionality of the article-title community plugin
 */
const CustomArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  let title = (fileData.frontmatter as { title?: string } | undefined)?.title;
  if (title) {
    // Strip numbered prefixes like "1. ", "2. " from display names
    title = stripNumericPrefix(title);
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>;
  } else {
    return null;
  }
};

CustomArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`;

export default (() => CustomArticleTitle) satisfies QuartzComponentConstructor;
