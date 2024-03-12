
const  loadHome= async (req, res) => {
    try {
      res.render("project");
     } catch (error) {console.log(error.message);
      throw new Error(error);
    }
  };



module.exports = { loadHome};