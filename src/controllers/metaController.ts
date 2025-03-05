import db from "../utils/db";

export const getAllMetas = async (req, res) => {
  try {
    const allUsers = await db.meta.findMany();

    res.status(200).json({ data: allUsers });
  } catch (err) {
    console.log(err);
  }
};

export const getMetaById = async (req, res) => {
  try {
    const metaId = req.params.id;
    const meta = await db.meta.findUnique({
      where: {
        id: metaId,
      },
    });
    res.status(200).json({ data: meta });
  } catch (err) {
    console.log(err);
  }
};

export const createMeta = async (req, res) => {
  try {
    const metaData = req.body;

    const meta = await db.meta.create({
      data: metaData,
    });
    res.status(200).json({ data: meta });
  } catch (err) {
    console.log(err);
  }
};

export const updateMeta = async (req, res) => {
  try {
    const metaId = req.params.id;
    const metaData = req.body;

    const meta = await db.meta.update({
      where: {
        id: metaId,
      },
      data: metaData,
    });
    res.status(200).json({ data: meta });
  } catch (err) {
    console.log(err);
  }
};

export const deleteMeta = async (req, res) => {
  try {
    const metaId = req.params.id;
    const meta = await db.meta.delete({
      where: {
        id: metaId,
      },
    });

    res.status(200).json({ data: {} });
  } catch (err) {
    console.log(err);
  }
};
