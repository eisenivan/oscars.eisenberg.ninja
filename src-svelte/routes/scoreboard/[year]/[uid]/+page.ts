export async function load({ params }: { params: { year: string; uid: string } }) {
	return {
		year: parseInt(params.year),
		uid: params.uid
	};
}
