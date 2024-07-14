import QRCode from 'qrcode.react';
import { fromHex } from '@cosmjs/encoding';

import { Button, Card, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { sizes } from '@/ui/theme/spacing';
import { copyToClipboard } from '@/ui/utils';

import './index.less';
import { CHAINS_ENUM } from '@/shared/constant';
import { useLocation } from 'react-router-dom';

function getAddressTypeUrl(address: string, chain: string) {
  if (address.startsWith('tb1') || chain === 'side') {
    if (address.length === 42) {
      return {
        algo: 'segwit',
        typeUrl: '/cosmos.crypto.segwit.PubKey',
      };
    } else if (address.length === 62) {
      return {
        algo: 'taproot',
        typeUrl: '/cosmos.crypto.taproot.PubKey',
      };
    }
  } else if (address.startsWith('bc1')) {
    if (address.length === 42) {
      return {
        algo: 'segwit',
        typeUrl: '/cosmos.crypto.segwit.PubKey',
      };
    } else if (address.length === 62) {
      return {
        algo: 'taproot',
        typeUrl: '/cosmos.crypto.taproot.PubKey',
      };
    }
  } else {
    throw new Error('Please switch to Native Segwit or Taproot address ');
  }
}

export default function ReceiveScreen() {
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const { state } = useLocation();
  // const { chain, type, base } = state as {
  //   chain: CHAINS_ENUM;
  //   type: 'receive' | 'send';
  //   base: string;
  // };

  const tools = useTools();
  console.log(`chain, type, base: `, state, currentAccount);
  debugger;

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Receive"
      />
      <Content>
        <Card
          bg="white"
          gap="lg"
          style={{
            flexDirection: 'column',
            justifyItems: 'start',
            borderRadius: '14px'
          }}>
          <Row full itemsCenter>
            <Image
              size={42}
              style={{
                borderRadius: '100%'
              }}
              src={state?.token?.logo_black ? state?.token?.logo_black : state?.token?.logo}></Image>

            <Column>
              <Row>
                <Text
                  preset="regular"
                  style={{
                    padding: '0'
                  }}
                  color="black"
                  text={state?.token?.name}></Text>
              </Row>

              <Row>
                <Text
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}
                  color="black"
                  bg="orange"
                  preset="sub"
                  text={state?.base === 'BTC' ? 'Bitcoin' : 'Side'}></Text>

                <Text
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    // display: 'none',
                  }}
                  color="black"
                  preset="sub"
                  bg="light_gray"
                  text={'Taproot'}></Text>
              </Row>
            </Column>
          </Row>

          <Row
            full
            style={{
              height: '1px',
              borderBottom: '1px solid #1E1E1F'
            }}
            bg="black_dark"></Row>

          <Row
            full
            onClick={(e) => {
              copyToClipboard(address).then(() => {
                tools.toastSuccess('Copied');
              });
            }}>
            <Text
              wrap
              text={
                <>
                  {currentAccount.address}
                  <Icon
                    containerStyle={{
                      display: 'inline-block',
                      marginLeft: '2px'
                    }}
                    color="black"
                    icon="copy2"></Icon>
                </>
              }
              style={{
                fontWeight: '400'
              }}
              color="background"></Text>
          </Row>
          <Column>
            <QRCode value={address || ''} renderAs="svg" size={sizes.qrcode}></QRCode>
          </Column>

          <Column>
            <Text
              color="background"
              style={{
                width: '270px',
                margin: 'auto',
                textAlign: 'center'
              }}
              text={`Send only ${state?.chain === 'BTC' ? 'BTC' : 'Side'} network assets to this address`}></Text>
          </Column>

          <Row style={{
            display: 'none',
          }} full>
            <Button full preset="primary" text="Set amount"></Button>
          </Row>
        </Card>

        {/* <Column gap="xl" mt="lg">
          <Column
            justifyCenter
            rounded
            style={{ backgroundColor: 'white', alignSelf: 'center', alignItems: 'center', padding: 10 }}>
            <QRCode value={address || ''} renderAs="svg" size={sizes.qrcode}></QRCode>
          </Column>

          <Row justifyCenter>
            <Icon icon="user" />
            <Text preset="regular-bold" text={currentAccount?.alianName} />
          </Row>
          <AddressBar />
        </Column> */}
      </Content>
    </Layout>
  );
}
