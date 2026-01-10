async function load({ params }) {
  return {
    year: parseInt(params.year)
  };
}
export {
  load
};
