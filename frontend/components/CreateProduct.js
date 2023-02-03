import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import useForm from '../lib/useForm';
import Form from './styles/Form';
import DisplayError from './ErrorMessage';
import { ALL_PRODUCTS_QUERY } from './Products';

// Create GQL Mutation
const CREATE_PRODUCT_MUTATION = gql`
  mutation CREATE_PRODUCT_MUTATION(
    # Variables passed in
    $name: String!
    $description: String!
    $price: Int!
    $image: Upload
  ) {
    createProduct(
      # Mutation
      data: {
        name: $name
        description: $description
        price: $price
        status: "AVAILABLE"
        # Create relationship && Separate image item
        photo: { create: { image: $image, altText: $name } }
      }
    ) {
      # Return fields
      id
      price
      description
      name
    }
  }
`;

// Handling forms in React using Custom Hook
export default function CreateProduct() {
  const { inputs, handleChange, clearForm, resetForm } = useForm({
    image: '',
    name: 'Sneakers',
    price: 12345,
    description: 'Cool shoes ;)',
  });

  const [createProduct, { loading, error, data }] = useMutation(
    CREATE_PRODUCT_MUTATION,
    {
      variables: inputs,
      /* Fetch updated products */
      refetchQueries: [{ query: ALL_PRODUCTS_QUERY }],
    }
  );

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        console.log('Create:', inputs);
        // Submit the inputfields to the backend:
        const res = await createProduct();
        console.log('Mutation Response:', res);
        clearForm();
      }}
    >
      {/* Handle Errors */}
      <DisplayError error={error} />

      {/* Disable group elements at once */}
      <fieldset disabled={loading} aria-busy={loading}>
        {/* File Input */}
        <label htmlFor="image">
          Image:
          <input
            required
            type="file"
            name="image"
            id="image"
            onChange={handleChange}
          />
        </label>
        <label htmlFor="name">
          Name:
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            value={inputs.name}
            onChange={handleChange}
          />
        </label>
        <label htmlFor="price">
          Price:
          <input
            type="number"
            name="price"
            id="price"
            placeholder="Price"
            value={inputs.price}
            onChange={handleChange}
          />
        </label>
        <label htmlFor="description">
          Description:
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            value={inputs.description}
            onChange={handleChange}
          />
        </label>

        <button type="submit">+ Add Product</button>

        {/* <button type="button" onClick={clearForm}>
        Clear Form
      </button>
      <button type="button" onClick={resetForm}>
        Reset Form
      </button> */}
      </fieldset>
    </Form>
  );
}
