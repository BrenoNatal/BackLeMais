import db from "../utils/db";

const getFriendshipRequestsSentBy = async (userId: string) => {
  const friendRequests = db.friendship.findMany({
    where: {
      userId: userId,
      status: "PENDING",
    },
    select: {
      status: true,
      user: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
      friendOf: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
    },
  });

  return friendRequests;
};

const getFriendshipRequestsReceivedBy = async (userId: string) => {
  const friendRequests = db.friendship.findMany({
    where: {
      friendId: userId,
      status: "PENDING",
    },
    select: {
      status: true,
      user: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
      friendOf: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
    },
  });

  return friendRequests;
};

export const getFriendshipRequests = async (userId: string) => {
  const received = await getFriendshipRequestsReceivedBy(userId);
  const sent = await getFriendshipRequestsSentBy(userId);

  return { received, sent };
};

export const getFriends = async (userId: string) => {
  const friends = await db.friendship.findMany({
    where: {
      OR: [
        {
          friendId: userId,
        },
        {
          userId: userId,
        },
      ],
      status: "FRIEND",
    },
    select: {
      status: true,
      user: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
      friendOf: {
        select: { id: true, name: true, profileImageUrl: true, username: true },
      },
    },
  });

  return friends;
};

export const createFriendship = async (req, res) => {
  try {
    const friendshipData = req.body;

    const checkFriendship = await db.friendship.findUnique({
      where: {
        id: {
          friendId: friendshipData.userId,
          userId: friendshipData.friendId,
        },
      },
    });

    if (checkFriendship) {
      throw new Error("Amizade duplicada");
    }

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

export const acceptFriendship = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.params.userId;

    const friendship = await db.friendship.update({
      where: { id: { friendId: friendId, userId: userId } },
      data: { status: "FRIEND" },
    });

    res.status(200).json({ data: friendship });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteFriendship = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.params.userId;

    const friendship = await db.friendship.delete({
      where: { id: { friendId: friendId, userId: userId } },
    });

    res.status(200).json({ data: friendship });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteAllFriendship = async (req, res) => {
  try {
    const friendship = await db.friendship.deleteMany();

    res.status(200).json({ data: friendship });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getAllUserFriendships = async (req, res) => {
  try {
    const userId = req.params.userId;

    const friends = await getFriends(userId);
    const friendRequests = await getFriendshipRequests(userId);

    res.status(200).json({ friends, friendRequests });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getAllFriendshipsRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const friends = await getFriendshipRequests(userId);

    res.status(200).json({ data: friends });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const checkFriendships = async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    const check1 = await db.friendship.findUnique({
      where: {
        id: {
          friendId: friendId,
          userId: userId,
        },
      },
    });

    const check2 = await db.friendship.findUnique({
      where: {
        id: {
          friendId: userId,
          userId: friendId,
        },
      },
    });

    console.log(check1, check2);

    if (check1) {
      res.status(200).json({ friendship: check1 });
      return;
    } else if (check2) {
      res.status(200).json({ friendship: check2 });
      return;
    }

    res.status(200).json({});
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};
