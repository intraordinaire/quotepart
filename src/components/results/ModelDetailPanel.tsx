"use client";

import React from "react";
import type { ModelId } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";
import type { SimulationInput } from "@/domain/types";
import { MODEL_CONTENT } from "@/lib/modelContent";

interface ModelDetailPanelProps {
  modelId: ModelId | null;
  results: CalculationResults;
  input: SimulationInput;
  onClose: () => void;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €";
}

export function ModelDetailPanel({
  modelId,
  results,
  onClose,
}: ModelDetailPanelProps): React.ReactElement | null {
  if (modelId === null) return null;

  const content = MODEL_CONTENT[modelId];

  return (
    <div className="model-detail-panel">
      <div className="model-detail-panel__header">
        <h2>{content.label}</h2>
        <button type="button" aria-label="Fermer" onClick={onClose}>
          ✕
        </button>
      </div>

      <section className="model-detail-panel__formula">
        <p>{content.formula}</p>
      </section>

      <section className="model-detail-panel__philosophy">
        <p>{content.philosophy}</p>
      </section>

      <section className="model-detail-panel__advantages">
        <h3>Avantages</h3>
        <ul>
          {content.advantages.map((adv) => (
            <li key={adv}>{adv}</li>
          ))}
        </ul>
      </section>

      <section className="model-detail-panel__limitations">
        <h3>Limites</h3>
        <ul>
          {content.limitations.map((lim) => (
            <li key={lim}>{lim}</li>
          ))}
        </ul>
      </section>

      {modelId === "m4_adjusted_time" && (
        <section className="model-detail-panel__m4">
          <div>
            <h3>Option A (revenus réels)</h3>
            <p>
              P1 : {formatMoney(results.m4_adjusted_time.optionA.p1Contribution)} — P2 :{" "}
              {formatMoney(results.m4_adjusted_time.optionA.p2Contribution)}
            </p>
          </div>
          <div>
            <h3>Option B (temps plein théorique)</h3>
            <p>
              P1 : {formatMoney(results.m4_adjusted_time.optionB.p1Contribution)} — P2 :{" "}
              {formatMoney(results.m4_adjusted_time.optionB.p2Contribution)}
            </p>
          </div>
        </section>
      )}

      {modelId === "m5_total_contribution" && (
        <section className="model-detail-panel__m5">
          <h3>Valeur du travail domestique</h3>
          <table>
            <thead>
              <tr>
                <th>Personne</th>
                <th>Valeur mensuelle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>P1</td>
                <td>{formatMoney(results.m5_total_contribution.p1DomesticMonthlyValue)}</td>
              </tr>
              <tr>
                <td>P2</td>
                <td>{formatMoney(results.m5_total_contribution.p2DomesticMonthlyValue)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
