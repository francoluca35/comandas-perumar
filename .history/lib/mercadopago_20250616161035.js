import mercadopagoModule from "mercadopago";

const mercadopago = mercadopagoModule.default ?? mercadopagoModule;

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export default mercadopago;
