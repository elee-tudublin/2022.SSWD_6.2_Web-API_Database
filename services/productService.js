// Product service functions

// Import dependencies

// Validation
const validate = require('../validators/baseValidators');

// DataAccess
const productData = require('../dataAccess/productData');

// Function to get all products
//
async function getProducts() {
    
    // call data access to get all products
    const products = await productData.getProducts();
  
    // return products
    return products;
  }

// Function to get product by id
//
async function getProductById(id) {
  // validate the id
  const validatedId = validate.validateId(id);

  if (validatedId) {
    // Call the data access function to get product with matching id
    const product = await productData.getProductById(validatedId);

    // return the product
    return product;
  } else {
    return "Invalid product id";
  }
}

// Function to get products in a specified category (by category id)
//
async function getProductsByCatId(id) {

    // validate the id
    const validatedId = validate.validateId(id);
  if (validatedId) {

    // Call the data access function to get product matching id
    const products = await productData.getProductsByCatId(validatedId);

    // return the products found
    return products;

  } else {
      return "Invalid product id";
  }
}

// Module exports
// expose these functions
module.exports = {
    getProducts,
    getProductById,
    getProductsByCatId
};


