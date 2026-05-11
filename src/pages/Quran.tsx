import { Helmet } from "react-helmet-async";
import { QuranReader } from "@/features/quran";

const Quran = () => (
	<>
		<Helmet>
			<title>Quran Reader | Hasanat</title>
			<meta
				name="description"
				content="Read Quran by surah, resume from your last ayah, and bookmark ayahs with English or Bangla translation."
			/>
			<link rel="canonical" href="https://hasanat-3375b.web.app/quran" />
		</Helmet>
		<QuranReader />
	</>
);

export default Quran;

