// base - Product.find({email: "usertwo@email.com"})

// bigQuery(bigQ) - ?search=coder&page=26&category=hoodies&rating[gte]=4&price[lte]=999&price[gte]=199&limit=2

class WhereClause {
  constructor(base, bigQ) {
    (this.base = base), (this.bigQ = bigQ);
  }

  search() {
    const searchWord = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });

    return this;
  }

  filter() {
    const copyOfBigQ = { ...this.bigQ };

    delete copyOfBigQ.search;
    delete copyOfBigQ.page;
    delete copyOfBigQ.limit;

    //convert copyOfBigQ Object to string
    let stringOfCopyQ = JSON.stringify(copyOfBigQ);

    // Watch backend Course L-109 & L-112
    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  //Mongoose doc aggregator.prototype
  pager(resultPerPage) {
    let currentPage = 1;

    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    // Will give how much value to skip for a particular page
    let skipValue = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipValue);

    return this;
  }
}

module.exports = WhereClause;
