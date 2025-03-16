import orderModel from "../models/orderModel.js";
import userModel from "../models/user.models.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//placing user order for frontend

const placeOrder = async (req, res) => {
  const frontend_url = "https://tomato-ten-snowy.vercel.app/";
  try {
    // Verificar se todos os campos necessários existem
    if (
      !req.body.items ||
      !Array.isArray(req.body.items) ||
      req.body.items.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Itens inválidos" });
    }

    const newOrder = new orderModel({
      userId: req.body.userId || req.userData._id, // Use a ID do userData se userId não estiver presente
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Se userId não estiver no body, use o da autenticação
    const userIdToUpdate = req.body.userId || req.userData._id;
    await userModel.findByIdAndUpdate(userIdToUpdate, { cartData: {} });

    // Garanta que todos os itens tenham quantity definida
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1, // Use 1 como padrão se quantity for undefined
    }));

    // Adicionar taxa de entrega
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    console.log(JSON.stringify(line_items, null, 2)); // Log mais detalhado

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ sucess: true, session_url: session.url }); // Use session.url em vez de session
  } catch (error) {
    console.log(error);
    return res.status(400).json({ sucess: false, message: error.message });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ sucess: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ sucess: false, messahe: "Error" });
  }
};

// user orders for frontend

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//Listing Orders for admin panel

const listOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
// api for updating order status

const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrder, updateStatus };
