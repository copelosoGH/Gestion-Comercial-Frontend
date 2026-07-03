import PlaceholderPage from '../../components/common/PlaceholderPage.jsx';

export default function Existencias() {
  return (
    <PlaceholderPage
      title="Existencias"
      endpoint="GET /productos/:id"
      descripcion="El detalle de stock por ubicacion ya se ve en Productos (Ver detalle). Aca se puede armar una vista consolidada cuando haya GET /ubicaciones."
    />
  );
}
