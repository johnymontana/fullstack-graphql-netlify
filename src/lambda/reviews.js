const neo4j = require("neo4j-driver");

const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

exports.handler = async (event, context) => {
  var reviews = [];
  const session = driver.session({ database: "neo4j" });
  try {
    const reviewsQuery = `
    MATCH (r:Review)-[:REVIEWS]->(b:Business)
    RETURN r{.text, .stars,created: toString(r.date), business: b.name} AS review
    `;

    const result = await session.executeRead((tx) =>
      tx.run(reviewsQuery)
    );

    result.records.forEach((record) => {
      reviews.push(record.get("review"));
    });

    return { statusCode: 200, body: JSON.stringify(reviews) };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed fetching data" }),
    };
  } finally {
    await session.close();
  }
};
