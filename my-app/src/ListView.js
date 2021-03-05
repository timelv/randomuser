import './App.scss';
import React from 'react';
import { getAllContacts } from './WebApiUtils';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { matchFilter } from './SearchUtils';
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
      currentUser: {},
      sortlabel: "ascending"
    };
  }

  componentDidMount() {
    this.getContacts().then(result => this.setState({ contacts: result.results.map((item) => this.flattenObject(item)) }));
  }

  async getContacts() {
    return await getAllContacts(10);
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

    const filterResult = matchFilter(this.state.contacts.map((contact) => contact), filterQuery, 0.1);
    this.setState({
      performedSearch: true,
      filteredContacts: filterResult,
      searchTerm: searchVal
    })
  }

  performSort() {
    let { sortDirection, sortlabel } = this.state;
    if (!sortDirection || sortDirection === "descending") {
      sortDirection = "ascending";
      sortlabel = "descending";
    } else {
      sortDirection = "descending";
      sortlabel = "ascending";
    }
    this.setState({ sortDirection, sortlabel });
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
    const { performedSearch, filteredContacts, searchTerm, sortDirection, currentUser, sortlabel } = this.state;
    contacts = performedSearch && searchTerm.length > 0 ? filteredContacts : contacts;

    if (sortDirection) {
      contacts = sortDirection === "ascending" ? contacts.sort(this.compare) : contacts.sort(this.compare).reverse();
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
                      <Button onClick={() => this.performSort()} type="submit" >{`Sort by name ${sortlabel}`}</Button>
                    </InputGroup.Append>
                  </InputGroup>

                  {contacts.length > 0 ? (
                    contacts.map((contact, i) => (
                      <Row key={i} className="cardWrapper">
                        <Col md={12} lg={12}>
                          <Link onClick={() => this.setState({ currentUser: contact })} to="/details">
                            <Card className="listingCard">
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
                          <Card.Title>{currentUser["name.title"]} {currentUser["name.first"]} {currentUser["name.last"]}</Card.Title>
                          <Card.Text>
                            <div className="personalDataWrapper">
                              <div><strong>Personal data: </strong></div>
                              <div>{currentUser.email}</div>
                              <div>{currentUser.phone}</div>
                              <div>Registered on: {new Date(currentUser["registered.date"]).toLocaleDateString('sv-SE')}</div>
                            </div>
                          </Card.Text>
                          <Card.Text>
                            <div className="addressWrapper">
                              <div><strong>Address: </strong></div>
                              <div>{currentUser["location.country"]} {currentUser["location.state"]}</div>
                              <div>{currentUser["location.city"]} {currentUser["location.street.name"]} {currentUser["location.street.number"]} {currentUser["location.street.postcode"]}</div>
                            </div>
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