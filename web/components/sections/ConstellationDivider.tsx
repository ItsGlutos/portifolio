import { BatConstellation } from "@/components/sky/BatConstellation";

/**
 * Divisor entre o Sobre e o tópico seguinte.
 *
 * A constelação fica centralizada no container e a hairline da seção é a
 * borda inferior deste bloco: sem isso, o Projetos perderia o border-top
 * (`.section + .section` deixa de casar) e a passagem ficaria sem linha.
 */
export function ConstellationDivider() {
  return (
    <div className="constellation-divider">
      <div className="container">
        <BatConstellation className="constellation-divider__bat" />
      </div>
    </div>
  );
}
