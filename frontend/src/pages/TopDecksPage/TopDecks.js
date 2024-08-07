import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import CloseButton from 'react-bootstrap/CloseButton'; // Import CloseButton
import NavScrollBar from "../../components/NavScrollBar/NavScrollBar";
import { getDecks, deleteDeck } from "../../services/deckService";
import { useUserContext } from "../../components/context/userContext";
import "./TopDecks.css";

function TopDecks() {
  const [decks, setDecks] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // Default sorting order is ascending
  const { user } = useUserContext(); // Access the user context

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const fetchedDecks = await getDecks();
        setDecks(fetchedDecks);
        console.log("decks fetched:", fetchedDecks);
      } catch (error) {
        console.error("Error fetching decks:", error);
      }
    };

    fetchDecks();
  }, []);

  useEffect(() => {
    if (decks.length > 0) {
      const sortedDecks = [...decks].sort((a, b) => {
        const priceA = parseFloat(a.totalPrice) || 0;
        const priceB = parseFloat(b.totalPrice) || 0;
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
      setDecks(sortedDecks);
    }
  }, [sortOrder, decks]);

  const handleDeleteDeck = async (deckId) => {
    if (!user) {
      alert("You need to be logged in to delete a deck.");
      return;
    }

    try {
      await deleteDeck(deckId);
      setDecks((prevDecks) =>
        prevDecks.filter((deck) => deck._id !== deckId)
      );
      console.log("Deck deleted successfully");
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  return (
    <div className="top-decks-container">
      <NavScrollBar />
      <div className="top-decks-button-container">
        <Link to="/create-deck">
          <Button variant="primary">Create New Deck</Button>
        </Link>
      </div>
      <div className="top-decks-sort-container">
        <label htmlFor="sort-order">Sort by price:</label>
        <select
          id="sort-order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <Row xs={1} md={2} className="g-3 justify-content-center">
        {decks.length > 0 ? (
          decks.map((deck) => (
            <Col key={deck._id} className="top-decks-custom-margin">
              <Card className="top-decks-fixed-card">
                {user && user._id === deck.userId && (
                  <CloseButton
                    className="top-decks-close-button"
                    onClick={() => handleDeleteDeck(deck._id)}
                  />
                )}
                <Link to={`/deck-details/${deck._id}`} style={{ textDecoration: "none" }}>
                  <Card.Img
                    variant="top"
                    src={deck.image} // Use the image URL from the deck data
                    className="top-decks-card-img-custom"
                  />
                  <Card.Body className="top-decks-card-body">
                    <Card.Title className="top-decks-card-title">{deck.title}</Card.Title>
                    <Card.Text className="top-decks-card-description">
                      {deck.description}
                    </Card.Text>
                    <Card.Text className="top-decks-card-price">
                      Price: {deck.totalPrice}$
                    </Card.Text>
                  </Card.Body>
                </Link>
              </Card>
            </Col>
          ))
        ) : (
          <p>No decks available.</p>
        )}
      </Row>
    </div>
  );
}

export default TopDecks;
