# Full Example: Webshop :moneybag:

## What it includes

- GraphQL type definitions
- Stripe Checkout Flow
- A custom GraphQL `resolver` function, hosted in Graphcool

## Config

This example needs an environment variable called `STRIPE_KEY`.
The `STRIPE_KEY` can be obtained by [creating a stripe account](https://dashboard.stripe.com/register)
and getting the token from the Account Settings.

## Setup

Download the example or [clone the repo](https://github.com/graphcool/graphcool):

```sh
curl https://codeload.github.com/graphcool/graphcool/tar.gz/master | tar -xz --strip=2 graphcool-master/examples/full-example
cd full-example
```

Install the CLI (if you haven't already):

```sh
npm install -g graphcool@next
```

You can now [deploy](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#graphcool-deploy) the Graphcool service that's defined in this directory. Before that, you need to install the node [dependencies](package.json#L14) for the defined functions:

```sh
yarn install      # install dependencies
graphcool deploy  # deploy service
```

When prompted which cluster you'd like to deploy, chose any of `Backend-as-a-Service`-options (`shared-eu-west-1`, `shared-ap-northeast-1` or `shared-us-west-2`) rather than `local`. 

## Data Setup

You can open the playground with `graphcool playground` and execute the following mutation to set up some initial data.

```graphql
mutation init {
  createUser(
    firstName: "Bob"
    lastName: "Meyer"
    email: "bob.meyer@test.com"
    address: "Secret Address"
    baskets: [{
      items: [{
        name: "iPhone X"
        price: 1200
        imageUrl: "https://cdn.vox-cdn.com/uploads/chorus_image/image/56645405/iphone_x_gallery1_2017.0.jpeg"
        description: "The new shiny iPhone"
      }]
    }]
  ) {
    id
    baskets {
      id
    }
  }
}
```



## Application Flow
 1. User is logged in or creates anonymous Account
 2. User creates a `Cart` that he puts `Item`s into
 3. When the User wants to Checkout, he insert his credit cart and address. We can use the stripe docs to mimic this step: Obtain a Stripe token by using the *Try Now* example in their [Docs](https://stripe.com/docs).
 4. With the inserted data we're also updating the `User` we created in the beginning, adding the name and address of the person
 5. Create a new Order in Graphcool with the Stripe Token, the `userId` and `basketId` you just created:
 
 ```graphql
 mutation order {
   createOrder(
     userId: "cj7kn28nn6fa90117qjwnut9v"
     basketId: "cj7kn28no6faa01175c8rsgsd"
   ) {
     id
   }
 }
 ```
 
 3. Pay the Order that you just created by calling the custom resolver:

  ```graphql
  mutation pay {
    pay(
    	orderId: "cj7knpozv7t6f01535quuud9s"
    	stripeToken: "tok_ybnh1HWnDZKMonE6lVkHLMVt"
    ) {
      success
    }
  }
  ```

## Local Development
To run the `pay.js` function locally, you can use the `scripts/run.js` file to run it.

## Limitations

* This example currently doesn't enforce permissions (which will be added soon)