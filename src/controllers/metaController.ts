import db from "../utils/db";

export const getAllMetas = async (req, res) => {
  try {
    const allMetas = await db.meta.findMany();

    res.status(200).json({ data: allMetas });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
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
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const createMeta = async (req, res) => {
  try {
    const metaData = req.body;

    const meta = await db.meta.create({
      data: metaData,
    });
    res.status(200).json({ data: meta });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
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
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
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
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};
