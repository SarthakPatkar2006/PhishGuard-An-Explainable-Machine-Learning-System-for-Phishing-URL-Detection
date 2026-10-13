import { Card, CardContent } from "../ui/card";
import { featureCards } from "../../lib/ui-data";

function FeatureGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {featureCards.map((feature) => (
        <Card className="transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80" key={feature.title}>
          <CardContent className="p-6">
            <feature.icon className="mb-5 h-9 w-9 text-teal-600" />
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { FeatureGrid };
