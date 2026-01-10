export async function load({ params }) {
	return {
		year: parseInt(params.year)
	};
}
