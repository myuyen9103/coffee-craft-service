import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Font, // Import Font
} from "@react-email/components";
import React from "react";
import { Decimal } from "@prisma/client/runtime/library";

import type { OrderWithDetails } from "../services/order.service.tsx";

type OrderItemWithProduct = OrderWithDetails["orderItems"][number];

interface OrderConfirmationEmailProps {
  order: OrderWithDetails;
  storeName?: string;
  storeUrl?: string;
}

// --- Base URL Configuration ---
const baseUrl = process.env.STORE_URL || "http://localhost:3000"; // Backend/API URL
const frontendBaseUrl = "https://coffee-craft.vercel.app"; // Your Vercel frontend URL
const defaultStoreName = "Coffee Craft";
const defaultProductImageUrl = `${baseUrl}/static/product-placeholder.png`; // Ensure this is publicly accessible

export const OrderConfirmationEmail = ({
  order,
  storeName = defaultStoreName,
  storeUrl = baseUrl,
}: OrderConfirmationEmailProps) => {
  const previewText = `Xác nhận đơn hàng #${order.id} từ ${storeName}`;
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  // Updated currency format
  const formatCurrency = (amount: Decimal | number): string => {
    const numericAmount =
      typeof amount === "number" ? amount : amount.toNumber();
    // Prepend VND and use standard number formatting
    return "VND " + new Intl.NumberFormat("vi-VN").format(numericAmount);
  };

  const subtotal = order.orderItems.reduce(
    (acc: Decimal, item: OrderItemWithProduct) => {
      const itemTotal = item.priceAtOrder.mul(item.quantity);
      return acc.add(itemTotal);
    },
    new Decimal(0)
  );

  const viewOrderUrl = `${storeUrl}/orders/${order.id}`;

  return (
    <Html>
      <Head>{/* Optional: Embed custom fonts */}</Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section - Text Logo */}
          <Section style={headerSection}>
            <Text style={logoText}>
              <span style={logoCoffee}>Coffee</span>
              <span style={logoCraft}>Craft</span>
            </Text>
          </Section>

          {/* Main Greeting */}
          <Section style={contentSection}>
            <Heading style={mainHeading}>
              Cảm ơn bạn đã đặt hàng tại {storeName}!
            </Heading>
            <Text style={paragraph}>
              Xin chào {order.shippingAddress.receiverName || "bạn"},
            </Text>
            <Text style={paragraph}>
              {storeName} đã nhận được yêu cầu đặt hàng #{order.id} của bạn và
              đang xử lý nhé. Bạn sẽ nhận được thông báo tiếp theo khi đơn hàng
              đã sẵn sàng được giao.
            </Text>
            <Section style={buttonContainer}>
              <Button style={statusButton} href={viewOrderUrl}>
                TÌNH TRẠNG ĐƠN HÀNG
              </Button>
            </Section>
            <Text style={noteText}>
              *Lưu ý nhỏ cho bạn: Bạn chỉ nên nhận hàng khi trạng thái đơn hàng
              là "Đang giao hàng" và nhớ kiểm tra Mã đơn hàng, Thông tin người
              gửi và Mã vận đơn để nhận đúng kiện hàng nhé.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section style={addressSectionStyle}>
            <Row>
              <Column style={iconColumn}>📍</Column>
              <Column>
                <Text style={sectionTitle}>Đơn hàng được giao đến</Text>
                <Row style={addressRow}>
                  <Column style={addressLabelColumn}>Tên:</Column>
                  <Column style={addressValueColumn}>
                    {order.shippingAddress.receiverName}
                  </Column>
                </Row>
                <Row style={addressRow}>
                  <Column style={addressLabelColumn}>Địa chỉ nhà:</Column>
                  <Column style={addressValueColumn}>
                    {order.shippingAddress.address}
                  </Column>
                </Row>
                <Row style={addressRow}>
                  <Column style={addressLabelColumn}>Điện thoại:</Column>
                  <Column style={addressValueColumn}>
                    {order.shippingAddress.receiverPhone}
                  </Column>
                </Row>
                <Row style={addressRow}>
                  <Column style={addressLabelColumn}>Email:</Column>
                  <Column style={addressValueColumn}>
                    {order.user?.email || "N/A"}
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Order Items */}
          <Section style={itemsSectionStyle}>
            <Row>
              <Column style={iconColumn}>📦</Column>
              <Column>
                <Text style={sectionTitle}>Kiện Hàng #1</Text>
              </Column>
            </Row>

            {order.orderItems.map((item: OrderItemWithProduct) => {
              // Construct product URL
              const productUrl = `${frontendBaseUrl}/product/${item.productId}`;
              return (
              <Row key={item.id} style={itemRow}>
                <Column width="160" style={itemImageColumn}>
                    <Link href={productUrl} target="_blank"> {/* Link added */}
                  <Img
                    src={
                      item.product.images?.[0]?.url || defaultProductImageUrl
                    }
                        width="150"
                        height="150"
                    alt={item.product.name}
                    style={productImage}
                  />
                    </Link>
                </Column>
                <Column style={itemDetailsColumn}>
                    <Link href={productUrl} target="_blank" style={productLink}> {/* Link added */}
                  <Text style={itemText}>
                    {item.product.name}{" "}
                    {item.productVariant ? `(${item.productVariant.name})` : ""}
                  </Text>
                    </Link>
                    <Text style={itemPrice}> {/* Moved price below name */}
                    {formatCurrency(item.priceAtOrder.mul(item.quantity))}
                  </Text>
                  <Text style={itemQuantity}>SL: {item.quantity}</Text>
                </Column>
              </Row>
              );
            })}
          </Section>

          {/* <Hr style={hr} />  */}

          {/* Totals Section */}
          <Section style={{"padding": "5px 30px 10px 30px"}}>
            <Row style={totalsRow}>
              <Column style={totalsLabel}>Thành tiền:</Column>
              <Column style={totalsValueColumn}>
                <Text style={totalsValue}>{formatCurrency(subtotal)}</Text>
              </Column>
            </Row>
            {order.shippingFee.greaterThan(0) && (
              <Row style={totalsRow}>
                <Column style={totalsLabel}>Phí vận chuyển:</Column>
                <Column style={totalsValueColumn}>
                  <Text style={totalsValue}>
                    {formatCurrency(order.shippingFee)}
                  </Text>
                </Column>
              </Row>
            )}
            {order.discountAmount.greaterThan(0) && (
              <Row style={totalsRow}>
                <Column style={totalsLabel}>
                  Giảm giá{" "}
                  {order.voucher?.code ? `(${order.voucher.code})` : ""}:
                </Column>
                <Column style={totalsValueColumn}>
                  <Text style={totalsValue}>
                    ({formatCurrency(order.discountAmount)})
                  </Text>
                </Column>
              </Row>
            )}
            <Row style={totalsRowBold}>
              <Column style={totalsLabelBold}>Tổng cộng:</Column>
              <Column style={totalsValueColumn}>
                <Text style={totalsValueBold}>
                  {formatCurrency(order.finalTotal)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Payment/Shipping Method */}
          <Section style={contentSection}>
            <Row style={methodRow}>
              <Column style={methodLabel}>Tùy chọn vận chuyển:</Column>
              <Column style={methodValue}>
                {
                  order.shippingAddress.address.includes("HCM")
                    ? "Giao hàng Hỏa tốc"
                    : "Giao hàng Tiêu chuẩn" /* Placeholder logic */
                }
              </Column>
            </Row>
            <Row style={methodRow}>
              <Column style={methodLabel}>Hình thức thanh toán:</Column>
              <Column style={methodValue}>
                {
                  order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.paymentMethod /* Placeholder */
                }
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Help Section */}
          <Section style={contentSection}>
            <Row>
              <Column style={iconColumn}>❓</Column>
              <Column>
                <Text style={sectionTitle}>Có phải bạn thắc mắc?</Text>
                <Text style={helpQuestion}>
                  Làm thế nào để thay đổi địa chỉ giao hàng, số điện thoại hoặc
                  thông tin người nhận hàng cho đơn hàng đã đặt?
                </Text>
                <Text style={helpAnswer}>
                  Nếu địa thông tin liên lạc/ giao hàng chưa chính xác, bạn có
                  thể hủy nếu đơn hàng chưa được chuyển sang trạng thái “Hoàn
                  tất đóng gói” và thử đặt lại đơn hàng mới với thông tin chính
                  xác hơn bạn nhé.
                </Text>
                <Section
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    marginBottom: "10px",
                  }}
                >
                  <Button
                    style={helpButton}
                    href={storeUrl /* Link to help page */}
                  >
                    NẾU CÒN THẮC MẮC, CLICK TẠI ĐÂY ĐỂ TÌM HIỂU THÊM!
                  </Button>
                </Section>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={logoText}>
              <span style={logoCoffee}>Coffee</span>
              <span style={logoCraft}>Craft</span>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} {storeName}.
            </Text>
            <Text style={footerText}>
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi tại{" "}
              <Link
                href={`mailto:support@${storeUrl.replace(/https?:\/\//, "")}`}
                style={link}
              >
                support@coffeecraft.com
              </Link>
              .
            </Text>
            <Text style={footerText}>
              Đây là thư tự động được tạo từ danh sách đăng ký của chúng tôi. Do
              đó, xin đừng trả lời thư này.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// --- Styles ---
const main = {
  backgroundColor: "#ffffff",
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  maxWidth: "680px",
};

const headerSection = {
  padding: "20px",
  borderBottom: "1px solid #e6e6e6",
};

const logoText = {
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
  padding: "10px 0",
};
const logoCoffee = {
  color: "#1a1a1a",
};
const logoCraft = {
  color: "#f5a623",
};

const contentSection = {
  padding: "20px 30px",
};

const addressSectionStyle = {
  padding: "10px 30px",
};

const itemsSectionStyle = {
  padding: "10px 30px",
};

const iconColumn = {
  width: "32px",
  verticalAlign: "top" as const,
    paddingTop: "3px",
  fontSize: "20px",
};

const mainHeading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1a1a1a",
  margin: "10px 0 20px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#333333",
  margin: "0 0 15px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "25px 0",
};

const statusButton = {
  backgroundColor: "#f5a623",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  border: "none",
};

const noteText = {
  fontSize: "12px",
  color: "#555555",
  lineHeight: "18px",
  marginTop: "25px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "0",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333333",
  margin: "5px 0 10px 0",
};

// Styles for aligned address
const addressRow = {
  marginBottom: "4px",
};
const addressLabelColumn = {
  width: "95px",
  paddingRight: "48px",
  fontSize: "14px",
  color: "#555555",
  verticalAlign: "top" as const,
};
const addressValueColumn = {
  fontSize: "14px",
  color: "#333333",
  verticalAlign: "top" as const,
};

const itemRow = {
  padding: "15px 0",
  borderBottom: "1px solid #e6e6e6",
};

const itemImageColumn = {
  verticalAlign: "top" as const,
    width: "160px",
};

const itemDetailsColumn = {
  paddingLeft: "15px",
  verticalAlign: "top" as const,
};

const itemText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#333",
  margin: "0 0 4px 0",
};

const itemQuantity = {
    fontSize: "14px", // Slightly larger quantity text
  color: "#585858",
  margin: 0,
};

const itemPriceColumn = { // Removed this column as price is now under details
    // width: "120px",
    // verticalAlign: "top" as const,
};

const itemPrice = {
  fontSize: "14px",
    color: "#f5a623",
    margin: '4px 0 0 0',
    fontWeight: 'bold',
};

const productImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
    width: "150px",
    height: "150px",
};

// Style for the product link
const productLink = {
    color: '#333', // Match item text color
    textDecoration: 'none', // Remove underline
};


const totalsRow = {
  margin: 0,
  display: "flex",
  justifyContent: "space-between",
};
const totalsRowBold = {
  ...totalsRow,
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #cccccc",
};

const totalsLabel = {
  fontSize: "14px",
  color: "#555555",
  textAlign: "left" as const,
  width: "150px",
};
const totalsLabelBold = {
  ...totalsLabel,
  fontWeight: "bold",
  color: "#333333",
};

const totalsValueColumn = {
  textAlign: "right" as const,
  width: "80%",
};

const totalsValue = {
  // Style for the Text component itself
  fontSize: "14px",
  color: "#555555",
  textAlign: "right" as const, // Explicitly set text align here
  fontWeight: "bold",
  display: "block",
};
const totalsValueBold = {
  ...totalsValue,
  fontWeight: "bold",
  color: "#f5a623",
  textAlign: "right" as const, // Explicitly set text align here
};

const methodRow = {
  margin: "6px 0",
};

const methodLabel = {
  fontSize: "14px",
  color: "#555555",
  width: "150px",
  paddingRight: "10px",
};

const methodValue = {
  fontSize: "14px",
  color: "#333333",
  fontWeight: "bold",
  textAlign: "right" as const,
};

const helpQuestion = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333333",
  marginBottom: "8px",
};

const helpAnswer = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#555555",
  marginBottom: "15px",
};

const helpButton = {
  ...statusButton,
  padding: "10px 25px",
  fontSize: "14px",
};

const footer = {
  padding: "20px",
  marginTop: "20px",
  borderTop: "1px solid #e6e6e6",
};

const footerText = {
  fontSize: "12px",
  color: "#888888",
  lineHeight: "18px",
  textAlign: "center" as const,
  marginBottom: "10px",
};

const link = {
  color: "#007bff",
  textDecoration: "none",
};
