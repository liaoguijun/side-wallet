import { useMemo, useState } from 'react';

import { CHAINS_ENUM } from '@/shared/constant';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useCalcPrice } from '@/ui/hooks/useCalcPrice';
import { useGetSideTokenList } from '@/ui/hooks/useGetTokenList';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useSignAndBroadcastTxRaw } from '@/ui/state/transactions/hooks/cosmos';
import { useUiTxCreateSendSideScreen } from '@/ui/state/ui/hooks';
import { fontSizes } from '@/ui/theme/font';
import { formatUnitAmount, parseUnitAmount } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';

export default function SideTxConfirmScreen() {
  const navigate = useNavigate();
  const { signAndBroadcastTxRaw } = useSignAndBroadcastTxRaw();
  const currentAccount = useCurrentAccount();
  const uiState = useUiTxCreateSendSideScreen();
  const [loading, setLoading] = useState(false);
  const { data: sideTokenList } = useGetSideTokenList();
  const toInfo = uiState.toInfo;
  const denom = uiState.base;
  const inputAmount = uiState.inputAmount;
  const fee = uiState.fee;
  const feeDenom = uiState.feeDenom;
  const memo = uiState.memo;

  const { curToken, feeToken } = useMemo(() => {
    const curToken = sideTokenList.find((item) => item.base === denom)!;
    const feeToken = sideTokenList.find((item) => item.base === feeDenom)!;
    return {
      curToken,
      feeToken
    };
  }, [sideTokenList]);

  const { data: feeByUSD } = useCalcPrice(fee, feeToken?.coingecko_id, feeToken?.exponent || 6);
  if (!curToken) {
    return <Layout />;
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const msg = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: currentAccount.address,
          toAddress: toInfo.address,
          amount: [
            {
              amount: parseUnitAmount(inputAmount, curToken.exponent),
              denom: curToken.base
            }
          ]
        }
      };
      const result = await signAndBroadcastTxRaw({
        messages: [msg],
        feeAmount: fee,
        feeDenom: feeDenom
      });
      navigate('TxSuccessScreen', { txid: result.tx_response.txhash, chain: CHAINS_ENUM.SIDE });
    } catch (err) {
      // navigate('TxFailScreen', { error: err });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="primary">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{}}>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Confirm Transaction"
      />
      <Column
        style={{
          flex: 1,
          padding: '40px 16px 24px'
        }}>
        <Column
          style={{
            flex: 1,
            gap: '10px'
          }}>
          <Row
            justifyBetween
            style={{
              alignItems: 'center',
              padding: '11px 16px',
              backgroundColor: '#1E1E1F',
              borderRadius: '14px'
            }}>
            <Row
              style={{
                alignItems: 'center'
              }}>
              <Image
                src={curToken.logo}
                size={42}
                style={{
                  borderRadius: '50%'
                }}
              />
              <Text
                text={curToken.symbol}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              />
            </Row>
            <Text
              text={inputAmount}
              style={{
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '24px'
              }}
            />
          </Row>
          <Column
            justifyBetween
            style={{
              padding: '16px',
              backgroundColor: '#1E1E1F',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
            <Text
              text="Recipient"
              color="white_muted"
              style={{
                fontSize: '14px',
                lineHeight: '24px'
              }}
            />
            <Text
              text={toInfo.address}
              style={{
                fontSize: '14px',
                lineHeight: '16px'
              }}
            />
          </Column>

          <Column
            justifyBetween
            style={{
              padding: '16px',
              backgroundColor: '#1E1E1F',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
            <Text
              text="Memo"
              color="white_muted"
              style={{
                fontSize: '14px',
                lineHeight: '24px'
              }}
            />
            <Text
              text={memo}
              style={{
                fontSize: '14px',
                lineHeight: '16px'
              }}
            />
          </Column>
        </Column>
        <Row
          justifyBetween
          style={{
            padding: '16px 12px',
            borderRadius: '10px',
            backgroundColor: '#1E1E1F'
          }}>
          <Text
            text="Tx Fee:"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px'
            }}
          />
          <Row>
            <Text
              text={`${formatUnitAmount(fee, feeToken.exponent)} ${feeToken.symbol}`}
              style={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px'
              }}
            />
            <Text
              text={`($${feeByUSD})`}
              color="white_muted"
              style={{
                fontSize: '16px',
                lineHeight: '24px'
              }}
            />
          </Row>
        </Row>
        <Button
          preset="primary"
          text="Confirm"
          onClick={handleSubmit}
          style={{
            marginTop: '12px'
          }}
        />
      </Column>
    </Layout>
  );
}