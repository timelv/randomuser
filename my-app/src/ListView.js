import './App.scss';
import React from 'react';
import { getAllContacts } from './WebApiUtils';
import Button from 'react-bootstrap/Button'
import string_score from 'string_score';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      searchTerm: "",
      performedSearch: false,
      filteredContacts: [],
      sortDirection: "",
      currentUser: {}
    };
  }

  componentDidMount() {
    this.getContacts().then(result => this.setState({ contacts: result.results.map((item) => this.flattenObject(item)) }));
  }

  async getContacts() {
    return await getAllContacts(10);
  }

  matchFilter(allItems, query, threshold) {
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
        //Mapping for easier comparison
        totalScore += itemComp[i].score(queryComp[i]);
        console.log(itemComp[i] + " : " + queryComp[i] + " score was: " + totalScore)
      }

      // Compare itemComp string to the queryComp.
      // Statement evaluates to true, then the item matches!
      return totalScore >= threshold;
    });
    return matchingItems;
  }

  flattenObject(ob, prefix = false, result = null) {
    result = result || {};

    // Preserve empty objects and arrays, they are lost otherwise
    if (prefix && typeof ob === 'object' && ob !== null && Object.keys(ob).length === 0) {
      result[prefix] = Array.isArray(ob) ? [] : {};
      return result;
    }

    prefix = prefix ? prefix + '.' : '';

    for (const i in ob) {
      if (Object.prototype.hasOwnProperty.call(ob, i)) {
        if (typeof ob[i] === 'object' && ob[i] !== null) {
          // Recursion on deeper objects
          this.flattenObject(ob[i], prefix + i, result);
        } else {
          result[prefix + i] = ob[i];
        }
      }
    }
    return result;
  }

  performSearch(searchVal) {
    const filterQuery = {
      "name.first": searchVal,
      "name.last": searchVal,
      "location.street.name": searchVal,
      "phone": searchVal,
      "email": searchVal
    };

    const filterResult = this.matchFilter(this.state.contacts.map((contact) => contact), filterQuery, 0.1);
    this.setState({
      performedSearch: true,
      filteredContacts: filterResult,
      searchTerm: searchVal
    })
  }

  performSort() {
    let { sortDirection } = this.state;
    if (!sortDirection || sortDirection === "Descending") {
      sortDirection = "Ascending";
    } else {
      sortDirection = "Descending";
    }
    this.setState({ sortDirection });
  }

  compare(a, b) {
    a = `${a["name.first"]} ${a["name.last"]}`;
    b = `${b["name.first"]} ${b["name.last"]}`;
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  render() {
    let { contacts } = this.state;
    const { performedSearch, filteredContacts, searchTerm, sortDirection, currentUser } = this.state;
    contacts = performedSearch && searchTerm.length > 0 ? filteredContacts : contacts;

    if (sortDirection && sortDirection === "Ascending") {
      contacts = contacts.sort(this.compare);
    } else {
      contacts = contacts.sort(this.compare).reverse();
    }

    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Container>
              <Row>
                <Col md={12} lg={10}>
                  <InputGroup className="mb-3">
                    <FormControl onChange={(e) => this.performSearch(e.target.value)}
                      placeholder="Search"
                      aria-label="Search"
                    />
                    <InputGroup.Append>
                      <Button onClick={() => this.performSort()} type="submit" >{`Sort by name ${sortDirection ? sortDirection : "Ascending"}`}</Button>
                    </InputGroup.Append>
                  </InputGroup>

                  {contacts.length > 0 ? (
                    contacts.map((contact, i) => (
                      <Row key={i} className="cardWrapper">
                        <Col md={12} lg={12}>
                          <Link onClick={() => this.setState({ currentUser: contact })} to="/details">
                            <Card>
                              <Card.Body>
                                <Row key={i} className="cardWrapper">
                                  <Col style={{ marginRight: "20px" }} md={1} lg={1}>
                                    <img src={contact["picture.medium"]} />
                                  </Col>
                                  <Col md={10} lg={10}>
                                    <Card.Title>{`${contact["name.first"]} ${contact["name.last"]}`}</Card.Title>
                                    <Card.Text>{contact.email}</Card.Text>
                                    <Card.Text>
                                      {contact["location.street.name"]} {contact["location.street.number"]}
                                    </Card.Text>
                                    <Card.Text>
                                      {contact.phone}
                                    </Card.Text>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Link>
                        </Col>
                      </Row>
                    ))
                  ) : performedSearch ? (
                    <div>
                      No search results...
                    </div>
                  ) : (
                        <div>
                          Fetching contact data...
                        </div>
                      )
                  }
                </Col>
              </Row>
            </Container>
          </Route>
          <Route path="/details">
            <Container>
              <Row>
                <Col lg={12}>
                  <Card>
                    <Card.Body>
                      <Row className="cardWrapper">
                        <Col style={{ marginRight: "20px" }} md={12} lg={12}>
                          <InputGroup className="mb-3">
                            <InputGroup.Append>
                              <Link to="/">
                                <Button className="backBtn">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="long-arrow-alt-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-long-arrow-alt-left fa-w-14 fa-7x"><path fill="currentColor" d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path></svg> Back to listing
                                </Button>
                              </Link>
                            </InputGroup.Append>
                          </InputGroup>
                          <img src={currentUser["picture.large"]}></img>
                        </Col>
                        <Col md={12} lg={12}>
                          <Card.Title>{currentUser["name.first"]} {currentUser["name.last"]}</Card.Title>
                          <Card.Text>{currentUser.email}</Card.Text>
                          <Card.Text>
                            {currentUser["location.street.name"]} {currentUser["location.street.number"]}
                          </Card.Text>
                          <Card.Text>
                            {currentUser.phone}
                          </Card.Text>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </Route>
        </Switch>
      </Router>
    );
  }
}