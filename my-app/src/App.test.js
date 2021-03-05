import { matchFilter } from './SearchUtils';

const sampleSearchParam = "tommy.sheikh";
const sampleQuery = {
  "name.first": sampleSearchParam,
  "name.last": sampleSearchParam,
  "location.street.name": sampleSearchParam,
  "phone": sampleSearchParam,
  "email": sampleSearchParam
};

const sampleUsers = [
  {
    "location.street.name": "Villaveien",
    "name.first": "Tommy",
    "name.last": "Sheikh",
    phone: "79156395",
    email: "tommy.sheikh@example.com"
  },
  {
    "location.street.name": "Calle del Pez",
    "name.first": "Sofia",
    "name.last": "Duran",
    phone: "944-441-731",
    email: "sofia.duran@example.com"
  }
]

test('Search filters down the array to one result item', () => {
  const filterResult = matchFilter(sampleUsers, sampleQuery, 0.1)
  expect(filterResult.length).toBe(1)
});

test('Search returns the correct person', () => {
  const filterResult = matchFilter(sampleUsers, sampleQuery, 0.1)
  expect(filterResult[0]["name.first"]).toBe("Tommy")
});