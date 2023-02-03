import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const ENDSESSION_MUTATION = gql`
  mutation {
    endSession
  }
`;

export default function SignOut() {
  const [signout, { data, loading }] = useMutation(ENDSESSION_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  async function handleClick() {
    const res = await signout();
    console.log(res);
  }
  return (
    <button type="button" onClick={handleClick}>
      Sign out
    </button>
  );
}
