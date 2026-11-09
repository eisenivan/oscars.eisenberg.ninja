export function load({ params }) {
	return { year: Number(params.year), uid: params.uid };
}
