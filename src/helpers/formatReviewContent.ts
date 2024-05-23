export function formatReviewContent(content: string): string {
  // any text surrounded by ** will be italicized
  const italicizedText = content.replace(/\*(.*?)\*/g, "<i>$1</i>");
  // any text surrounded by -- will be bolded
  const boldedText = italicizedText.replace(/-(.*?)-/g, "<b>$1</b>");
  // any text surrounded by __ will be both italicized and bolded
  const bothText = boldedText.replace(/_(.*?)_/g, "<b><i>$1</i></b>");

  return bothText;
}
