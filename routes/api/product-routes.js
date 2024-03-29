const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint


// GET all Prodcuts
router.get('/', async (req, res) => {
  // Find all products
  try {
    const productData = await Product.findAll({
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
      { 
        model: Category,
        attributes: ['category_name'],
      },
      {
        model: Tag,
        attributes: ['tag_name'],
      }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single product
router.get('/:id', async (req, res) => {
  // Find a single product by its `id`
  try {
    const productData = await Product.findByPk(req.params.id, {
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
      { 
        model: Category,
        attributes: ['category_name'],
      },
      {
        model: Tag,
        attributes: ['tag_name'],
      }],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagID: req.body.tagID
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagID.length) {
        const productTagID = req.body.tagID.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagID);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productIDTags) => res.status(200).json(productIDTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      ProductTag.findAll({
          where: { product_id: req.params.id }});
    })
    .then((productTags) => {
      // create filtered list of new tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTagIDs = req.body.tagID
        .filter((tag_id) => !productIDTags.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagID.includes(tag_id))
      .map(({ id }) => id);
                  
    // run both actions
    return Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
  });

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;
