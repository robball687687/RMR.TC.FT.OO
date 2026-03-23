export const tokenFor = (opt, optItem) =>
  JSON.stringify({
    label: optItem.optionItemName,
    optionId: opt.option.tcMenuItemOptionId,
    itemId: optItem.tcMenuItemOptionItemsId,
    price: Number(optItem.price ?? 0),
  });
