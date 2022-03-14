# 6.2 Web API & Database: Create New Products

Enda Lee 2022

### Quick Start

1. Download or `fork` the start site from this repository.
2. Open in VS Code.
2. copy `sample.env` to `.env` and configure for your database.
3. In a terminal run `npm install`
4. Start the application using `npm run dev`



## Introduction

In this tutorial you will add new products the Database via an **`HTTP POST`** request to the API. The body of the POST request will include the values for a new product which need to be validated and inserted.

The web API will use SQL commands to accomplish the above but that will be hidden from users of the API who will only see the HTTP interface.

![App Flow](./media/app_flow.png)



## Inserting new products



### 1. The controller endpoint

We need a new endpoint in the `product controller` to accept **`POST`** requests to **create/ insert** new products. The product data will be sent as `JSON` in the `request body`. 

```javascript
// This endpoint will return all product data from the database
// Note that this handles a POST request (router.post)
router.post('/', async(req, res) => {

  // read data request body, this will be the new product
  const newProduct = req.body;
  
  // If data missing return 400
  if (typeof newProduct === "undefined") {
    res.statusMessage = "Bad Request - missing product data";
    res.status(400).json({ content: "error" });
  }
  // log the data to the console
  console.log(`product data sent:\n ${newProduct}`);

  // Call productService to create the new product
  try {
    const result = await productService.addNewProduct(newProduct);

    // Send response back to client
    res.json(result);

    // Catch and send errors
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }

});
```



### 2. The service

The **`addNewProduct( newProduct )`** function will first validate `newProduct`. 

```javascript
async function addNewProduct(productForm) {

  // declare variables
  let result;

    // Call the product validator - kept seperate to avoid clutter here
    let validatedProduct = productValidator.validateNewProduct(productForm); 

    // If validation returned a product object - save to database
    if (validatedProduct) {
      // Insert
      result = await productData.createProduct(validatedProduct);

      return result;
    
    } else {
      return ('invalid product data');
    }
}
```



If successful it will then call the `createProduct()` function in `productData.js` to insert it into the database.

#### Validation

Add a new validator script, `productValidator.js` to the `validators` folder. This will contain functions for validating products.

![validators.js](./media/validators_js.png)



Copy the following code, which includes the `validateProduct()` function, into **`productValidator.js`**.

*Read the code comments for details*

```javascript
//
// Functions for validating products
//

// for documentation see: https://www.npmjs.com/package/validator
const validator = require('validator');

// Import product object model
const Product = require('../models/product');

// Validate the body data, sent by the client, for a new product
// formProduct represents the data filled in a form
// It needs to be validated before using in gthe application
function validateNewProduct(formProduct) {
    // Declare constants and variables
    let validatedProduct;

    // debug to console - if no data
    if (formProduct === null) {
        console.log('validateNewProduct(): Parameter is null');
    }
    // Validate form data for new product fields
    // Creating a product does not need a product id
    // Adding '' to the numeric values makes them strings for validation purposes ()
    // appending + '' to numbers as the validator only works with strings
    if (
        validator.isNumeric(formProduct.category_id + '', { no_symbols: true, allow_negatives: false }) && 
        !validator.isEmpty(formProduct.product_name) && 
        !validator.isEmpty(formProduct.product_description) && 
        validator.isNumeric(formProduct.product_stock + '', { no_symbols: true, allow_negatives: false }) && 
        validator.isCurrency(formProduct.product_price + '', { no_symbols: true, allow_negatives: false }))
    {
        // Validation passed
        // create a new Product instance based on Product model object
        // no value for product id (passed as null)
        validatedProduct = new Product(
                0, // New product as no id
                formProduct.category_id,
                // escape is to sanitize - it removes/ encodes any html tags
                validator.escape(formProduct.product_name),
                validator.escape(formProduct.product_description),
                formProduct.product_stock,
                formProduct.product_price
            );
    } else {
        // debug
        console.log("validateNewProduct(): Validation failed");
    }
    // return new validated product object
    return validatedProduct;
}

// Module exports
// expose these functions
module.exports = {
  validateNewProduct
}
```



Also create a new folder named `models` and add a new file, `product.js` to the folder. This will define a `Product` object for use by the validator.

![Product Object](./media/product_js.png)

Add the following code to **`product.js`**

```javascript
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Using_a_constructor_function
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/default_parameters

function Product(id = 'undefined', cat = 'undefined', name, desc, stock, price) {

    this.id = Number(id);
    this.category_id = Number(cat);
    this.product_name = name;
    this.product_description = desc;
    this.product_stock = Number(stock);
    this.product_price = Number(price);
}

module.exports = Product;
```



### 3. Product data

Finally add a data access function to insert the new product into the database.

The following function, **`createProduct()`** goes into **`productData.js`**

```javascript
// Insert a new product into the database
// Return the result
//
async function createProduct(product) {
    let newProduct;

    // execute query using prisma.product.create
    // Note the data object
    try {
        // New product so no id
        newProduct = await prisma.product.create({
            data: {
                category_id: Number(product.category_id), 
                product_name: product.product_name, 
                product_description: product.product_description, 
                product_stock: Number(product.product_stock), 
                product_price: Number(product.product_price)
            }
        });

    // Catch and log errors to server side console 
    } catch (err) {
        console.log('DB Error - create product: ', err.message);
    } finally {

    }
    // return the new product
    return newProduct;
}
```



## Testing Product insert

This is a bit difficult to do in a web browser as headers would need to be modified in developer tools. Instead of that we will use an API testing tool called Insomnia. Download the free version from https://insomnia.rest/ then install.

### Insomnia Setup

#### 1. Add a new request collection

![Insomnia create collection](./media/insomnia_create.jpg)

#### 2. Add a new request

![insomnia new request](./media/insomnia_new_req.jpg)

####  

#### 2. Name the Request (and set method to GET).

![insomnia](./media/insomnia_req_method.jpg)

 

#### 3. Make a request to get all products.

![insomnia POST](./media/insomnia_post.jpg)

###  

### Using Insomnia to send a POST request:

#### First add a new request named create product

set the request method to POST and the body data type to JSON:

![img](file:///C:/Users/ELEE-T~1/AppData/Local/Temp/msohtmlclip1/01/clip_image010.jpg)

#### Then add the endpoint as some JSON data in the request body

*Note there is no* `id`

![A screenshot of a computer  Description automatically generated with medium confidence](./media/insomnia_json.jpeg)

#### Check that the request Content-Type header is set correctly.

![insomnia header](./media/insomnia_header.jpg)

 

#### Send the request.

If all goes well the request will send and the response will display the data inserted.

![insomnia send](./media/insomnia_send.jpg)

#### Verify that the data was inserted.

Make a request to get all products via Insomnia (a browser will also work).

![insomnia get](./media/insomnia_get.jpg)

 



## Exercises

Add functionality for the following:

**1.**   **Update a Product.**

This is very similar to insert/ POST but uses a HTTP PUT request. also sends the existing Product id (in addition to the data sent for insert) of the product to be updated, in the request body. Add the function and test with Insomnia.

**2.**  **Deleting a Product.**

This is very similar to getting a single product but uses the HTTP DELETE method instead of GET. Add the function and test with Insomnia.

**3.**   **Use Insomnia to test the new endpoints.**




------

Enda Lee 2022
