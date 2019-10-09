// Dependencies
import { Op } from 'sequelize';
import * as Yup from 'yup';
import { parseISO, isBefore, subHours, startOfDay, endOfDay } from 'date-fns';

// MODELS
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};

    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'organizig',
          attributes: ['name', 'email'],
        },
      ],
      attributes: ['user_id', 'title', 'description', 'date', 'location'],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const { title, description, location, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please, select a banner' });
    }

    const { filename } = req.file;

    const schema = Yup.object().shape({
      title: Yup.string().required('Title'),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Something Goes wrong' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please, select a banner' });
    }

    const isPast = parseISO(date);

    if (isBefore(isPast, new Date())) {
      return res.status(400).json({ error: 'Only future dates are permitted' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      title,
      banner: filename,
      description,
      location,
      date,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Something Wrong' });
    }

    const checkUser = req.userId;

    const meetup = await Meetup.findByPk(req.params.id); // passa o ID do meetup pela URL

    if (checkUser !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: 'You can only update yours Meetups' });
    }

    const { date } = req.body; // Pega a data no BODY
    const isPast = parseISO(date); // Formata a data

    if (isBefore(isPast, new Date())) {
      return res.status(400).json({ error: 'Only future dates are permitted' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    await meetup.update(req.body);

    return res.json({ meetup });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res.status(400).json({
        error: "You can't cancel other peoples Meetups",
      });
    }
    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    const hoursBefore = subHours(meetup.date, 3);

    if (isBefore(hoursBefore, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 3 hours in advance.',
      });
    }

    await meetup.destroy();

    return res.json({ Success: 'Meetup Deleted' });
  }
}

export default new MeetupController();
