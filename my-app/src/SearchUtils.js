//Is used for scoring method
import string_score from 'string_score';
export const matchFilter = (allItems, query, threshold) => {
  // Create an array of properties that are defined in the query.
  const properties = Object.keys(query)
    .filter(key => query[key].trim().length > 0);
  // Create a comparison string for the query item.
  const queryComp = properties.map(p => query[p]);
  // Filter down to get the matching items.
  const matchingItems = allItems.filter((item) => {
    // Create a comparison string for the current
    // item that consists of the property values
    // that are included in the query.
    const itemComp = properties.map(p => item[p]);
    let totalScore = 0;
    for (let i = 0; i < itemComp.length; i++) {
      //using third party library for scoring, no customer wants to pay to reinvent the wheel
      totalScore += itemComp[i].score(queryComp[i]);
    }

    // Statement evaluates to true, then the item matches!
    return totalScore >= threshold;
  });
  return matchingItems;
};