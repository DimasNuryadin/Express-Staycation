const fs = require('fs-extra');
const path = require('path');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Member = require('../models/Member');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs')

module.exports = {
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      if (req.session.user == null || req.session.user == undefined) {
        res.render('index', {
          alert,
          title: 'Staycation | Login'
        });
      } else {
        res.redirect('/admin/dashboard');
      }
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Users.findOne({ username: username });
      if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
          req.session.user = {
            id: user._id,
            username: user.username
          }
          res.redirect('/admin/dashboard');
        } else {
          req.flash('alertMessage', 'Password yang anda masukan tidak cocok!!');
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/signin');
        }
      } else {
        req.flash('alertMessage', 'User yang anda masukan tidak ada!!');
        req.flash('alertStatus', 'danger');
        res.redirect('/admin/signin');
      }
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
  actionLogout: async (req, res) => {
    req.session.destroy();
    res.redirect('/admin/signin')
  },


  viewDashboard: async (req, res) => {
    try {
      const member = await Member.find()
        .estimatedDocumentCount();
      const booking = await Booking.find()
        .estimatedDocumentCount();
      const item = await Item.find()
        .estimatedDocumentCount();
      res.render('admin/dashboard/view_dashboard', {
        title: 'Staycation | Dashboard',
        user: req.session.user,
        member,
        booking,
        item
      });
    } catch (error) {
      res.redirect('/admin/dashboard');
    }
  },

  viewCategory: async (req, res) => {
    try {
      const category = await Category.find();
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      res.render('admin/category/view_category', {
        category,
        alert,
        title: 'Staycation | Category',
        user: req.session.user
      });
    } catch (error) {
      res.redirect('/admin/category');
    }

  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });
      req.flash('alertMessage', 'Success add category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },
  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      const category = await Category.findOne({ _id: id });
      category.name = name;
      await category.save();
      req.flash('alertMessage', 'Success update category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      await Category.findByIdAndDelete({ _id: id });
      req.flash('alertMessage', 'Success delete category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },


  viewBank: async (req, res) => {
    const bank = await Bank.find();
    const alertMessage = req.flash('alertMessage');
    const alertStatus = req.flash('alertStatus');
    const alert = { message: alertMessage, status: alertStatus };
    res.render('admin/bank/view_bank', {
      title: 'Staycation | Bank',
      alert,
      bank,
      user: req.session.user
    });
  },
  addBank: async (req, res) => {
    try {
      const { name, nameBank, nomorRekening } = req.body;
      await Bank.create({ name, nameBank, nomorRekening, imageUrl: `images/${req.file.filename}` });
      req.flash('alertMessage', 'Success add Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank');
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, name, nameBank, nomorRekening } = req.body;
      const bank = await Bank.findOne({ _id: id });
      if (req.file == undefined) {
        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        await bank.save();
        req.flash('alertMessage', 'Success update bank');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/bank');
      } else {
        // Delete file image
        await fs.unlink(path.join(`public/${bank.imageUrl}`));

        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        bank.imageUrl = `images/${req.file.filename}`
        await bank.save();
        req.flash('alertMessage', 'Success update bank');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/bank');
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },
  deleteBank: async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findByIdAndDelete({ _id: id });
      // Delete file image
      await fs.unlink(path.join(`public/${bank.imageUrl}`));

      req.flash('alertMessage', 'Success delete bank');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },


  viewItem: async (req, res) => {
    try {
      const item = await Item.find()
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });
      const category = await Category.find();
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      res.render('admin/item/view_item', {
        title: 'Staycation | Item',
        category,
        alert,
        item,
        action: 'view',
        user: req.session.user
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  addItem: async (req, res) => {
    try {
      const { categoryId, title, price, city, about } = req.body;
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId });
        const newItem = {
          categoryId: category._id,
          title,
          description: about,
          price,
          city
        }
        const item = await Item.create(newItem);
        category.itemId.push({ _id: item._id });
        await category.save();
        for (let index of req.files) {
          const imageSave = await Image.create({ imageUrl: `images/${index.filename}` });
          item.imageId.push({ _id: imageSave._id });
          await item.save()
        }
        req.flash('alertMessage', 'Success add item');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/item');
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  showImageItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: 'id imageUrl' });
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      res.render('admin/item/view_item', {
        title: 'Staycation | Show Image Item',
        alert,
        item,
        action: 'show image',
        user: req.session.user
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  showEditItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });
      const category = await Category.find();
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      res.render('admin/item/view_item', {
        title: 'Staycation | Edit Item',
        alert,
        item,
        category,
        action: 'edit',
        user: req.session.user
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  editItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, title, price, city, about } = req.body;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });

      if (req.files.length > 0) {
        for (let i = 0; i < item.imageId.length; i++) {
          const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });
          // Delete file image
          await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
          imageUpdate.imageUrl = `images/${req.files[i].filename}`;
          await imageUpdate.save();
        }
        item.title = title;
        item.price = price;
        item.city = city;
        item.description = about;
        item.categoryId = categoryId;
        await item.save();
        req.flash('alertMessage', 'Success update item');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/item');
      } else {
        item.title = title;
        item.price = price;
        item.city = city;
        item.description = about;
        item.categoryId = categoryId;
        await item.save();
        req.flash('alertMessage', 'Success update item');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/item');
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate('imageId');
      for (let index of item.imageId) {
        Image.findOne({ _id: index._id }).then(async (image) => {
          fs.unlink(path.join(`public/${image.imageUrl}`));
          await image.deleteOne();
        }).catch((error) => {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        });
      }
      await item.deleteOne();
      req.flash('alertMessage', 'Success delete item');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },


  viewDetailItem: async (req, res) => {
    const { itemId } = req.params;
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      const feature = await Feature.find({ itemId: itemId });
      const activity = await Activity.find({ itemId: itemId });
      res.render('admin/item/detail_item/view_detail_item', {
        title: 'Staycation | Detail Item',
        alert,
        itemId,
        feature,
        activity,
        user: req.session.user
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show_detail_item/${itemId}`);
    }
  },
  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash('alertMessage', 'Image not found')
        req.flash('alertStatus', 'danger')
        res.redirect(`/admin/item/show_detail_item/${itemId}`);
      }
      const feature = await Feature.create({ name, qty, itemId, imageUrl: `images/${req.file.filename}` });
      const item = await Item.findOne({ _id: itemId });
      item.featureId.push({ _id: feature._id });
      await item.save();

      req.flash('alertMessage', 'Success add Feature')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body;
    try {
      const feature = await Feature.findOne({ _id: id });
      if (req.file == undefined) {
        feature.name = name;
        feature.qty = qty;
        await feature.save();
        req.flash('alertMessage', 'Success update feature');
        req.flash('alertStatus', 'success');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } else {
        // Delete file image
        await fs.unlink(path.join(`public/${feature.imageUrl}`));

        feature.name = name;
        feature.qty = qty;
        feature.imageUrl = `images/${req.file.filename}`
        await feature.save();
        req.flash('alertMessage', 'Success update feature');
        req.flash('alertStatus', 'success');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const feature = await Feature.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('featureId');
      for (let i of item.featureId) {
        if (i._id.toString() === feature._id.toString()) {
          item.featureId.pull({ _id: feature._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${feature.imageUrl}`));
      await feature.deleteOne();

      req.flash('alertMessage', 'Success delete feature');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },


  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;
    try {
      if (!req.file) {
        req.flash('alertMessage', 'Image not found')
        req.flash('alertStatus', 'danger')
        res.redirect(`/admin/item/show_detail_item/${itemId}`);
      }
      const activity = await Activity.create({ name, type, itemId, imageUrl: `images/${req.file.filename}` });
      const item = await Item.findOne({ _id: itemId });
      item.activityId.push({ _id: activity._id });
      await item.save();

      req.flash('alertMessage', 'Success add Activity')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body;
    try {
      const activity = await Activity.findOne({ _id: id });
      if (req.file == undefined) {
        activity.name = name;
        activity.type = type;
        await activity.save();
        req.flash('alertMessage', 'Success update activity');
        req.flash('alertStatus', 'success');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      } else {
        // Delete file image
        await fs.unlink(path.join(`public/${activity.imageUrl}`));

        activity.name = name;
        activity.type = type;
        activity.imageUrl = `images/${req.file.filename}`
        await activity.save();
        req.flash('alertMessage', 'Success update activity');
        req.flash('alertStatus', 'success');
        res.redirect(`/admin/item/show-detail-item/${itemId}`);
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const activity = await Activity.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('activityId');
      for (let i of item.activityId) {
        if (i._id.toString() === activity._id.toString()) {
          item.activityId.pull({ _id: activity._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${activity.imageUrl}`));
      await activity.deleteOne();

      req.flash('alertMessage', 'Success delete activity');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/show-detail-item/${itemId}`)
    }
  },


  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/view_booking', {
        title: 'Staycation | Booking',
        user: req.session.user,
        booking
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/booking`)
    }
  },
  showDetailBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      const booking = await Booking.findOne({ _id: id })
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/show_detail_booking', {
        title: 'Staycation | Detail Booking',
        user: req.session.user,
        booking,
        alert
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/booking`)
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = 'Accept';
      await booking.save();
      req.flash('alertMessage', 'Success confirmation payment');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = 'Reject';
      await booking.save();
      req.flash('alertMessage', 'Success reject payment');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  }
}