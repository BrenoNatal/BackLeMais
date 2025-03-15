import db from "../utils/db";

export const createFriendship = async (req, res) => {
  try {
    const friendshipData = req.body;

    const friendship = await db.friendship.create({
      data: friendshipData,
    });

    res.status(200).json({ data: friendship });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};
