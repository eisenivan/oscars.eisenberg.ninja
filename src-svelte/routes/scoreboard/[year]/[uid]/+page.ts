export async function load({ params }) {
	return {
		year: parseInt(params.year),
		uid: params.uid
	};
}
