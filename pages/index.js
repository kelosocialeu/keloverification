// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function Home() {
  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-medium tracking-wide uppercase text-violet bg-violet-light rounded-full px-3 py-1 mb-6">
          Vérification manuelle
        </span>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          La passerelle de vérification entre{' '}
          <span className="text-violet">W Social</span> et{' '}
          <span className="text-violet">Kelo Social</span>
        </h1>

        <p className="mt-6 text-lg text-gray-500 leading-relaxed">
          Ce service permet de confirmer qu'un compte W Social t'appartient, afin de
          t'attribuer le badge vérifié sur Kelo Social. Les informations transmises servent
          uniquement à cette vérification, rien d'autre. Le processus est entièrement manuel.
        </p>

        <div className="mt-10">
          <Link href="/verification">
            <Button>Commencer la vérification</Button>
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          <Step
            title="1. Tu soumets ton pseudo"
            text="Indique ton nom d'utilisateur W Social et donne ton consentement."
          />
          <Step
            title="2. Vérification manuelle"
            text="Une personne de l'équipe consulte ton profil W Social publiquement."
          />
          <Step
            title="3. Badge attribué"
            text="Une fois validé, le badge vérifié apparaît sur ton profil Kelo Social."
          />
        </div>
      </section>
    </Layout>
  );
}

function Step({ title, text }) {
  return (
    <div className="bg-surface rounded-xl2 p-6 text-left">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}
