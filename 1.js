function investment(year) {
  let initMoney = 1000000000;

  let deposite = 350000000;
  let rateDepo = 3.5;

  let initCap = 650000000;

  let obligation = (30 * initCap) / 100;
  let rateObl = 13;

  let initA = (35 * initCap) / 100;
  let rateA = 14.5;

  let initB = initCap - (obligation + initA);
  let rateB = 12.5;

  let valueDepo = (deposite * rateDepo * year) / 100;
  let valueObl = (obligation * rateObl * year) / 100;
  let valueShareA = (initA * rateA * year) / 100;
  let valueShareB = (initB * rateB * year) / 100;

  return initMoney + (valueDepo + valueObl + valueShareA + valueShareB);
}

investment(2);
