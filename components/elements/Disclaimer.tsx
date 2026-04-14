import { DisclaimerComponent } from '@rainbow-me/rainbowkit';

const Disclaimer: DisclaimerComponent = ({
  Text,
  Link,
}) => (
  <Text>
    By connecting my wallet, I agree to the{' '}
    <Link href="https://cdn.nft.com/nft_com_terms_of_service.pdf">
      {' '}
      Terms of Service{' '}
    </Link>
    and acknowledge the
    <Link href="https://cdn.nft.com/nft_com_privacy_policy.pdf">
      {' '}
      Privacy Policy
    </Link>
    .
  </Text>
);

export default Disclaimer;
