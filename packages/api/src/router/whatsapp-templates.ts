export const whatsappTemplates = {
  packagePurchased: (serviceName: string, quantity: number, price: string) =>
    `✅ *Pacote adquirido com sucesso!*\n\n` +
    `Você comprou um pacote de *${quantity} ${serviceName}*.\n` +
    `*Valor total:* R$ ${price}\n` +
    `O pagamento será realizado no primeiro atendimento.\n\n` +
    `Agende seus serviços através do nosso app ou site!`,

  packagePaymentConfirmed: (
    serviceName: string,
    quantity: number,
    price: string,
    remaining: number,
  ) =>
    `💳 *Pagamento confirmado!*\n\n` +
    `Pacote: ${quantity} ${serviceName}\n` +
    `Valor pago: R$ ${price}\n` +
    `Sessões restantes: ${remaining}\n\n` +
    `Obrigado por sua compra!`,
};
